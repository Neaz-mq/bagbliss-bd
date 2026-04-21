'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      className="admin-panel flex h-screen overflow-hidden"
      style={{ background: '#f4f6fb' }}
    >
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable content — generous padding creates gap from sidebar + breathing room */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            padding: '28px 32px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#e2e8f0 transparent',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}