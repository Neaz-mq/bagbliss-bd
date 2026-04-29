'use client'

import { useEffect, useState } from 'react'
import { useSocket }            from './useSocket'

export function useOrderTracking(orderId: string | null) {
  const { socket, connected } = useSocket()
  const [status, setStatus]   = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!connected || !orderId) return
    socket.emit('join:customer', { orderId })
  }, [connected, orderId, socket])

  useEffect(() => {
    if (!orderId) return

    const onUpdate = (data: { orderId: string; status: string; message?: string }) => {
      if (data.orderId === orderId) {
        setStatus(data.status)
        setMessage(data.message ?? null)
      }
    }

    socket.on('order:updated', onUpdate)
    return () => { socket.off('order:updated', onUpdate) }
  }, [socket, orderId])

  return { status, message, connected }
}