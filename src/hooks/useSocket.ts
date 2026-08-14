'use client'

import { useEffect, useState } from 'react'
import { Socket }               from 'socket.io-client'
import { connectSocket, getSocket } from '@/lib/socket'

export function useSocket() {
  // Lazy initializer runs once on mount (client-only, since this hook is
  // only ever called from 'use client' components) — this replaces the old
  // `socketRef.current ?? getSocket()` render-time ref read, which React's
  // rules-of-hooks lint (react-hooks/refs) correctly flags: refs must not
  // be read during render. getSocket() is a cheap singleton getter (it
  // either returns the existing socket or lazily creates it), so calling
  // it here is safe and gives us a real Socket instance immediately.
  const [socket] = useState<Socket>(() => getSocket())

  // Seed `connected` from the socket's *current* state instead of setting
  // it inside the effect body (react-hooks/set-state-in-effect) — this way
  // the effect only ever calls setState from event-driven callbacks
  // (onConnect/onDisconnect), which is exactly the "subscribe to an
  // external system" pattern effects are meant for.
  const [connected, setConnected] = useState(() => socket.connected)

  useEffect(() => {
    connectSocket()

    const onConnect    = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socket.on('connect',    onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect',    onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [socket])

  return { socket, connected }
}