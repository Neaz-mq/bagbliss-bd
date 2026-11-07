'use client'

import { useEffect, useState } from 'react'
import { useSocket }            from './useSocket'

/**
 * orderId + accessToken (order-success লিংকের `?t=`) দুটোই লাগে।
 * accessToken দিয়ে সার্ভার থেকে ছোট-মেয়াদী টোকেন নিয়ে তবেই রুমে ঢোকা যায়।
 */
export function useOrderTracking(orderId: string | null, accessToken: string | null) {
  const { socket, connected } = useSocket()
  const [status, setStatus]   = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!connected || !orderId || !accessToken) return
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch(
          `/api/orders/socket-token?id=${encodeURIComponent(orderId)}&t=${encodeURIComponent(accessToken)}`,
          { cache: 'no-store' }
        )
        if (!res.ok) return
        const { token } = (await res.json()) as { token?: string }
        if (!cancelled && token) socket.emit('join:customer', { token })
      } catch (err) {
        console.error('[order-tracking]', err)
      }
    })()

    return () => { cancelled = true }
  }, [connected, orderId, accessToken, socket])

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