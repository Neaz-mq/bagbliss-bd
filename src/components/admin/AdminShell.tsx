'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      suppressHydrationWarning
      className="admin-panel"
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#f4f6fb',
      }}
    >
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
      }}>
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '28px 32px 60px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#e2e8f0 transparent',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}