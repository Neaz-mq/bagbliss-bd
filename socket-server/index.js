/* eslint-disable */
require('dotenv').config()
const express    = require('express')
const http       = require('http')
const { Server } = require('socket.io')
const cors       = require('cors')
const jwt        = require('jsonwebtoken')
const crypto     = require('crypto')

const app    = express()
app.set('trust proxy', 1) // Render/Railway এর প্রক্সির পেছনে সঠিক client IP পেতে
const server = http.createServer(app)

// অনুমোদিত ডোমেইন env থেকে — কমা দিয়ে একাধিক দেওয়া যায়:
//   CLIENT_URL=https://bagbliss-bd.vercel.app,https://www.yourdomain.com
// ডোমেইন বদলালে কোড ছুঁতে হবে না, শুধু env বদলে রিস্টার্ট দিলেই হবে।
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean)

// লোকাল ডেভেলপমেন্টের জন্য localhost — প্রোডাকশনে বাদ
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:3000')
}
const PORT               = process.env.PORT        || 4000
const EMIT_SECRET        = process.env.EMIT_SECRET
const SOCKET_JWT_SECRET  = process.env.SOCKET_JWT_SECRET

// ── Fail fast if secrets aren't configured ─────────────────────────────────
if (!EMIT_SECRET || !SOCKET_JWT_SECRET) {
  console.error('❌ EMIT_SECRET and SOCKET_JWT_SECRET must be set in env. Exiting.')
  process.exit(1)
}
if (ALLOWED_ORIGINS.length === 0) {
  console.error('❌ CLIENT_URL must be set in env (e.g. https://bagbliss-bd.vercel.app). Exiting.')
  process.exit(1)
}

// ── Socket.IO setup ───────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods:     ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout:  60000,
  pingInterval: 25000,
})

// ── State ─────────────────────────────────────────────────────────────────
const onlineVisitors = new Map()  // socketId → { page, joinedAt }
const adminSockets   = new Set()  // socketIds that passed admin-token verification

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({ origin: ALLOWED_ORIGINS }))
app.use(express.json())

// ── Health check ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:   'ok',
    visitors: onlineVisitors.size,
    admins:   adminSockets.size,
    uptime:   process.uptime(),
  })
})

// ── Emit endpoint (called server-to-server by Next.js API routes only) ────
// 🔒 secret মেলানো constant-time এ (timing attack ঠেকাতে)
function safeEqual(a, b) {
  const x = Buffer.from(String(a ?? ''))
  const y = Buffer.from(String(b ?? ''))
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

// 🔒 ভুল secret দিয়ে বারবার চেষ্টা (brute-force) ঠেকাতে IP-ভিত্তিক সীমা:
// ১ মিনিটে সর্বোচ্চ ২০ বার ভুল হলে সাময়িক ব্লক
const failedEmit = new Map() // ip → { count, resetAt }
const EMIT_MAX_FAILS = 20
setInterval(() => {
  const now = Date.now()
  for (const [ip, v] of failedEmit) if (v.resetAt < now) failedEmit.delete(ip)
}, 60_000).unref()

app.post('/emit', (req, res) => {
  const ip  = req.ip
  const rec = failedEmit.get(ip)
  if (rec && rec.resetAt > Date.now() && rec.count >= EMIT_MAX_FAILS) {
    return res.status(429).json({ error: 'Too many attempts' })
  }

  const { secret, event, data, room } = req.body || {}

  if (!safeEqual(secret, EMIT_SECRET)) {
    const cur = rec && rec.resetAt > Date.now() ? rec : { count: 0, resetAt: Date.now() + 60_000 }
    cur.count++
    failedEmit.set(ip, cur)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (typeof event !== 'string' || !event || event.length > 64) {
    return res.status(400).json({ error: 'Invalid event' })
  }

  if (room) {
    io.to(room).emit(event, data)
  } else {
    io.emit(event, data)
  }

  console.log(`[EMIT] ${event} → ${room || 'all'}`, JSON.stringify(data).slice(0, 100))
  res.json({ success: true, event, room })
})

// ── Socket Connection ─────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[CONNECT] ${socket.id}`)

  // ── Join rooms ─────────────────────────────────────────────────────────
  socket.on('join:admin', ({ token }) => {
    let payload
    try {
      payload = jwt.verify(token, SOCKET_JWT_SECRET)
    } catch (err) {
      socket.emit('error', { message: 'Invalid or expired admin token' })
      console.log(`[ADMIN JOIN REJECTED] ${socket.id} — ${err.message}`)
      return
    }

    if (payload.scope !== 'admin-socket' || payload.role !== 'admin') {
      socket.emit('error', { message: 'Invalid token scope' })
      return
    }

    socket.join('admin')
    adminSockets.add(socket.id)
    socket.emit('joined:admin', { message: 'Welcome to admin room' })
    console.log(`[ADMIN JOIN] ${socket.id} (user: ${payload.sub})`)

    socket.emit('visitors:update', { count: onlineVisitors.size })
  })

  // 🔒 কাস্টমার রুমে ঢুকতে Next.js-এর দেওয়া সই-করা টোকেন লাগে।
  // সরাসরি orderId পাঠালে আর ঢোকা যাবে না (অন্যের অর্ডার স্ট্যাটাস দেখা ঠেকাতে)।
  socket.on('join:customer', (payload) => {
    const token = payload && typeof payload.token === 'string' ? payload.token : ''
    let decoded
    try {
      decoded = jwt.verify(token, SOCKET_JWT_SECRET)
    } catch (err) {
      socket.emit('error', { message: 'Invalid or expired order token' })
      return
    }

    if (decoded.scope !== 'order-socket' || typeof decoded.orderId !== 'string') {
      socket.emit('error', { message: 'Invalid token scope' })
      return
    }

    socket.join(`order:${decoded.orderId}`)
    console.log(`[CUSTOMER] ${socket.id} tracking order ${decoded.orderId}`)
  })

  socket.on('visitor:page', (payload) => {
    // 🔒 যেকোনো ক্লায়েন্ট এটা পাঠাতে পারে — টাইপ/দৈর্ঘ্য যাচাই, নইলে মেমরি ফুলে যেত
    const page = payload && typeof payload.page === 'string' ? payload.page.slice(0, 200) : ''
    if (!page.startsWith('/')) return
    onlineVisitors.set(socket.id, { page, joinedAt: new Date() })
    io.to('admin').emit('visitors:update', {
      count:    onlineVisitors.size,
      visitors: [...onlineVisitors.values()],
    })
  })

  // ── Admin actions ──────────────────────────────────────────────────────
  // Trust is established once, at join:admin. No secret needed per-action —
  // only sockets that passed JWT verification are ever in `adminSockets`.
  socket.on('order:status:update', (payload) => {
    const orderId = payload && payload.orderId
    const status  = payload && payload.status
    if (typeof orderId !== 'string' || typeof status !== 'string' || orderId.length > 64 || status.length > 32) return
    if (!adminSockets.has(socket.id)) {
      socket.emit('error', { message: 'Not authorized as admin' })
      return
    }
    io.to(`order:${orderId}`).emit('order:updated', { orderId, status })
    console.log(`[ORDER STATUS] ${orderId} → ${status} (by ${socket.id})`)
  })

  // ── Disconnect ─────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    adminSockets.delete(socket.id)
    onlineVisitors.delete(socket.id)

    io.to('admin').emit('visitors:update', {
      count:    onlineVisitors.size,
      visitors: [...onlineVisitors.values()],
    })

    console.log(`[DISCONNECT] ${socket.id} — ${reason}`)
  })
})

// ── Start ──────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   BagBliss Socket Server             ║
  ║   Port: ${PORT}                          ║
  ║   Ready for connections ✅            ║
  ╚══════════════════════════════════════╝
  `)
})