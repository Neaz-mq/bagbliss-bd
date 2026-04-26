'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      className="admin-panel"
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#f4f6fb',
      }}
    >
      {/* Sidebar — fixed width, never shrinks */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right side — topbar + scrollable content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
      }}>
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

        {/* This scrolls independently */}
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