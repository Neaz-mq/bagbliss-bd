'use client'

import { Menu } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

interface Props {
  onMenuClick: () => void
}

export default function AdminTopbar({ onMenuClick }: Props) {
  const { data: session } = useSession()

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-500 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <span className="hidden md:block text-sm font-medium text-slate-700">
            {session?.user?.name ?? 'Admin'}
          </span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm text-slate-400 hover:text-rose-500 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}