'use client'

import { Menu, Bell, Search } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

interface Props {
  onMenuClick: () => void
}

export default function AdminTopbar({ onMenuClick }: Props) {
  const { data: session } = useSession()

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu size={18} />
        </button>

        {/* Search bar — desktop */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-56 lg:w-72">
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search orders, products..."
            className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* User */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="flex flex-col items-end">
            <p className="hidden md:block text-xs font-semibold text-slate-700 leading-none">
              {session?.user?.name?.split(' ')[0] ?? 'Admin'}
            </p>
            <p className="hidden md:block text-xs text-slate-400 mt-0.5">Administrator</p>
          </div>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #e91e8c, #f43f5e)' }}
          >
            {session?.user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="hidden md:block text-xs text-slate-400 hover:text-rose-500 font-medium transition-colors ml-1"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}