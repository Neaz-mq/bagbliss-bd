'use client'

import { useEffect }    from 'react'
import { usePathname }  from 'next/navigation'
import { useSocket }    from './useSocket'

export function useVisitorTracker() {
  const { socket, connected } = useSocket()
  const pathname              = usePathname()

  useEffect(() => {
    if (!connected) return
    socket.emit('visitor:page', { page: pathname })
  }, [connected, pathname, socket])
}