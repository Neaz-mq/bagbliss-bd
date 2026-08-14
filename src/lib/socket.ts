import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000', {
      autoConnect:       false,
      reconnection:      true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports:        ['websocket', 'polling'],
    })
  }
  return socket
}

export function connectSocket(): Socket {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect()
}

// ── Emit event to socket server from Next.js API ─────────────────────────
// Server-to-server only (Next.js API routes → socket server's /emit).
// No hardcoded fallback secret — if env vars are missing, refuse to emit
// rather than silently using a known/leaked default.
export async function serverEmit(
  event:  string,
  data:   unknown,
  room?:  string
) {
  const url    = process.env.SOCKET_SERVER_URL
  const secret = process.env.SOCKET_EMIT_SECRET

  if (!url) {
    console.error('[SOCKET EMIT] SOCKET_SERVER_URL is not set — refusing to emit')
    return false
  }

  if (!secret) {
    console.error('[SOCKET EMIT] SOCKET_EMIT_SECRET is not set — refusing to emit')
    return false
  }

  try {
    const res = await fetch(`${url}/emit`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ secret, event, data, room }),
    })
    if (!res.ok) throw new Error(`Socket emit failed: ${res.status}`)
    return true
  } catch (err) {
    console.error('[SOCKET EMIT]', err)
    return false
  }
}