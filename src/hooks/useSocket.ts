'use client'

import { useEffect, useRef, useState } from 'react'
import { Socket }                       from 'socket.io-client'
import { connectSocket, getSocket }     from '@/lib/socket'

export function useSocket() {
  const [connected, setConnected] = useState(false)
  const socketRef                 = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = connectSocket()
    socketRef.current = socket

    const onConnect    = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socket.on('connect',    onConnect)
    socket.on('disconnect', onDisconnect)

    if (socket.connected) setConnected(true)

    return () => {
      socket.off('connect',    onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  return { socket: socketRef.current ?? getSocket(), connected }
}