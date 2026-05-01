/* eslint-disable */
require('dotenv').config()
const express    = require('express')
const http       = require('http')
const { Server } = require('socket.io')
const cors       = require('cors')

const app    = express()
const server = http.createServer(app)

const ALLOWED_ORIGIN = process.env.CLIENT_URL || 'http://localhost:3000'
const PORT           = process.env.PORT        || 4000
const EMIT_SECRET    = process.env.EMIT_SECRET || 'bagbliss-socket-secret-2026'

// ── Socket.IO setup ───────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://bagbliss-bd.vercel.app',
      ALLOWED_ORIGIN,
    ],
    methods:     ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout:  60000,
  pingInterval: 25000,
})

// ── State ─────────────────────────────────────────────────────────────────
const onlineVisitors = new Map()  // socketId → { page, joinedAt }
const adminSockets   = new Set()  // admin socket IDs

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({ origin: ALLOWED_ORIGIN }))
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

// ── Emit endpoint (called by Next.js API) ─────────────────────────────────
app.post('/emit', (req, res) => {
  const { secret, event, data, room } = req.body

  // Verify secret
  if (secret !== EMIT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
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
  socket.on('join:admin', ({ secret }) => {
    if (secret !== EMIT_SECRET) {
      socket.emit('error', { message: 'Invalid admin secret' })
      return
    }
    socket.join('admin')
    adminSockets.add(socket.id)
    socket.emit('joined:admin', { message: 'Welcome to admin room' })
    console.log(`[ADMIN JOIN] ${socket.id}`)

    // Send current online count to newly joined admin
    socket.emit('visitors:update', { count: onlineVisitors.size })
  })

  socket.on('join:customer', ({ orderId }) => {
    if (orderId) {
      socket.join(`order:${orderId}`)
      console.log(`[CUSTOMER] ${socket.id} tracking order ${orderId}`)
    }
  })

  socket.on('visitor:page', ({ page }) => {
    onlineVisitors.set(socket.id, { page, joinedAt: new Date() })
    // Notify admins of visitor count update
    io.to('admin').emit('visitors:update', {
      count:    onlineVisitors.size,
      visitors: [...onlineVisitors.values()],
    })
  })

  // ── Admin actions ──────────────────────────────────────────────────────
  socket.on('order:status:update', ({ orderId, status, secret: s }) => {
    if (s !== EMIT_SECRET) return
    // Notify customer tracking this order
    io.to(`order:${orderId}`).emit('order:updated', { orderId, status })
    console.log(`[ORDER STATUS] ${orderId} → ${status}`)
  })

  // ── Disconnect ─────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    adminSockets.delete(socket.id)
    onlineVisitors.delete(socket.id)

    // Update admin visitor count
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