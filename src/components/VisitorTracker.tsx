'use client'

import { useEffect }          from 'react'
import { usePathname }        from 'next/navigation'
import { useSocket }          from '@/hooks/useSocket'
import { startKeepAlive,
         stopKeepAlive }      from '@/lib/keepAlive'

export default function VisitorTracker() {
  const { socket, connected } = useSocket()
  const pathname              = usePathname()

  // Start keep-alive ping on mount
  useEffect(() => {
    startKeepAlive()
    return () => stopKeepAlive()
  }, [])

  // Track page visits
  useEffect(() => {
    if (!connected) return
    socket.emit('visitor:page', { page: pathname })
  }, [connected, pathname, socket])

  return null
}