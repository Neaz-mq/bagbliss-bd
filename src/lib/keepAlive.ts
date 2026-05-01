// Pings the socket server every 14 minutes to prevent Render from sleeping
// Render sleeps after 15 minutes of inactivity

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000'
const INTERVAL   = 14 * 60 * 1000 // 14 minutes

let timer: ReturnType<typeof setInterval> | null = null

export function startKeepAlive() {
  if (timer) return // already running
  if (typeof window === 'undefined') return // server side only
  if (!SOCKET_URL.includes('onrender.com')) return // only needed on Render

  console.log('[KEEP-ALIVE] Started pinging socket server every 14 min')

  timer = setInterval(async () => {
    try {
      const res = await fetch(`${SOCKET_URL}/health`)
      const data = await res.json()
      console.log('[KEEP-ALIVE] Ping OK →', data.status, `| visitors: ${data.visitors}`)
    } catch {
      console.warn('[KEEP-ALIVE] Ping failed — server may be sleeping')
    }
  }, INTERVAL)
}

export function stopKeepAlive() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}