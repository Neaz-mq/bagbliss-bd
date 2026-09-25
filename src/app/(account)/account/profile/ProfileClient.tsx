'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  User, Mail, Phone, Camera, Save, ArrowLeft, Check,
  ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useHydrated } from '@/hooks/useHydrated'

// ── Gender options (feeds the custom Dropdown below) ────────────────────────
interface DropdownOption { value: string; label: string }

const GENDER_OPTIONS: DropdownOption[] = [
  { value: '',           label: 'Select gender' },
  { value: 'female',     label: 'Female' },
  { value: 'male',       label: 'Male' },
  { value: 'other',      label: 'Other' },
  { value: 'prefer_not', label: 'Prefer not to say' },
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// ── Date helpers (for the custom DatePicker) ────────────────────────────────
function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function toDisplayDate(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}

function parseISODate(iso: string): Date | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

// Builds a fixed 6-row (42-cell) calendar grid for the given month,
// including the trailing days of the previous/next month so every
// week row is fully populated.
function buildCalendarGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay() // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startOffset)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })
}

const navBtnStyle: React.CSSProperties = {
  width: '28px', height: '28px', borderRadius: '8px', border: 'none',
  background: 'rgba(26,26,46,0.04)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', cursor: 'pointer', color: 'var(--color-primary)',
}

// ── Custom Dropdown ──────────────────────────────────────────────────────────
// Same floating-panel pattern used elsewhere in the app (checkout / admin
// pages): a pill/rounded trigger button + a position:fixed panel that lives
// outside any ancestor's overflow clipping, and follows the trigger on
// scroll instead of closing abruptly.
function Dropdown({
  value, options, onChange, placeholder = 'Select…',
}: {
  value: string
  options: DropdownOption[]
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null)
  const btnRef   = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const computeCoords = () => {
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width })
  }

  const openDropdown = () => {
    if (open) { setOpen(false); return }
    computeCoords()
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return
      if (panelRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }

    let raf = 0
    const onScrollOrResize = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const rect = btnRef.current?.getBoundingClientRect()
        if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) { setOpen(false); return }
        computeCoords()
      })
    }

    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', escHandler)
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', escHandler)
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [open])

  const selected = options.find(o => o.value === value)

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        ref={btnRef}
        onClick={openDropdown}
        suppressHydrationWarning
        style={{
          width: '100%', padding: '0.875rem 1rem',
          border: `2px solid ${open ? 'var(--color-accent)' : 'rgba(26,26,46,0.1)'}`,
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body)', fontSize: '0.95rem',
          color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left', outline: 'none',
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown
          size={16}
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
            color: 'var(--color-text-muted)', flexShrink: 0,
          }}
        />
      </button>

      {open && coords && (
        <div
          ref={panelRef}
          className="profile-float-panel"
          style={{
            position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 1000,
            background: 'white', borderRadius: '14px', border: '1px solid rgba(26,26,46,0.08)',
            boxShadow: '0 16px 40px rgba(15,23,42,0.16)', padding: '6px',
            maxHeight: '260px', overflowY: 'auto',
          }}
        >
          {options.map(o => {
            const active = o.value === value
            return (
              <button
                key={o.value || '__empty__'}
                type="button"
                suppressHydrationWarning
                onClick={() => { onChange(o.value); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                  padding: '9px 12px', border: 'none', borderRadius: '9px',
                  background: active ? 'rgba(233,30,140,0.06)' : 'transparent',
                  color: active ? 'var(--color-accent)' : 'var(--color-text-primary)',
                  fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(26,26,46,0.04)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {o.label}
                {active && <Check size={14} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Custom Date Picker ───────────────────────────────────────────────────────
// Replaces the native <input type="date"> (whose calendar popup can't be
// restyled) with a themed calendar panel: month navigation, a 6-row day
// grid, an accent-colored selection, a today outline, and Clear/Today
// shortcuts. Value is kept in the same 'YYYY-MM-DD' shape the form/API
// already expects, just formatted as MM/DD/YYYY for display.
function DatePicker({
  value, onChange, placeholder = 'mm/dd/yyyy',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const btnRef   = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const selectedDate = parseISODate(value)
  const today = new Date()
  const todayISO = toISODate(today)

  const [viewYear,  setViewYear]  = useState(selectedDate?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth()   ?? today.getMonth())

  // Slightly narrower panel so it still fits inside very small phone
  // viewports (e.g. 320–360px) without needing horizontal scroll.
  const [panelWidth, setPanelWidth] = useState(300)

  const computeCoords = () => {
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = Math.min(300, window.innerWidth - 16)
    setPanelWidth(width)
    const maxLeft = window.innerWidth - width - 8
    setCoords({ top: rect.bottom + 6, left: Math.max(8, Math.min(rect.left, maxLeft)) })
  }

  const openPicker = () => {
    if (open) { setOpen(false); return }
    if (selectedDate) { setViewYear(selectedDate.getFullYear()); setViewMonth(selectedDate.getMonth()) }
    computeCoords()
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return
      if (panelRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }

    let raf = 0
    const onScrollOrResize = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const rect = btnRef.current?.getBoundingClientRect()
        if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) { setOpen(false); return }
        computeCoords()
      })
    }

    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', escHandler)
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', escHandler)
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const grid = buildCalendarGrid(viewYear, viewMonth)

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1)
  }
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1)
  }

  const pick = (d: Date) => { onChange(toISODate(d)); setOpen(false) }

  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    pick(today)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        ref={btnRef}
        onClick={openPicker}
        suppressHydrationWarning
        style={{
          width: '100%', padding: '0.875rem 2.75rem 0.875rem 1rem', position: 'relative',
          border: `2px solid ${open ? 'var(--color-accent)' : 'rgba(26,26,46,0.1)'}`,
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body)', fontSize: '0.95rem',
          color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          background: 'white', textAlign: 'left', cursor: 'pointer', outline: 'none',
        }}
      >
        {value ? toDisplayDate(value) : placeholder}
        <CalendarIcon
          size={16}
          style={{
            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)', pointerEvents: 'none',
          }}
        />
      </button>

      {open && coords && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed', top: coords.top, left: coords.left, zIndex: 1000, width: `${panelWidth}px`,
            background: 'white', borderRadius: '16px', border: '1px solid rgba(26,26,46,0.08)',
            boxShadow: '0 16px 40px rgba(15,23,42,0.16)', padding: '1rem', boxSizing: 'border-box',
          }}
        >
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <button type="button" onClick={goPrevMonth} suppressHydrationWarning style={navBtnStyle} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={goNextMonth} suppressHydrationWarning style={navBtnStyle} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', padding: '4px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {grid.map((d, i) => {
              const iso        = toISODate(d)
              const inMonth    = d.getMonth() === viewMonth
              const isSelected = value === iso
              const isToday    = iso === todayISO
              return (
                <button
                  key={i}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => pick(d)}
                  style={{
                    width: '100%', aspectRatio: '1', border: isToday && !isSelected ? '1.5px solid var(--color-accent)' : 'none',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--color-accent)' : 'transparent',
                    color: isSelected ? 'white' : inMonth ? 'var(--color-text-primary)' : 'rgba(26,26,46,0.28)',
                    fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(233,30,140,0.08)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(26,26,46,0.06)' }}>
            <button
              type="button" suppressHydrationWarning
              onClick={() => { onChange(''); setOpen(false) }}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: '4px 6px' }}
            >
              Clear
            </button>
            <button
              type="button" suppressHydrationWarning
              onClick={goToday}
              style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', padding: '4px 6px' }}
            >
              Today
            </button>
          </div>
        </div>
      )}

      <style>{`
        .profile-float-panel { scrollbar-width: thin; scrollbar-color: rgba(233,30,140,0.35) transparent; }
        .profile-float-panel::-webkit-scrollbar { width: 6px; }
        .profile-float-panel::-webkit-scrollbar-track { background: transparent; }
        .profile-float-panel::-webkit-scrollbar-thumb { background: rgba(233,30,140,0.35); border-radius: 999px; }
        .profile-float-panel::-webkit-scrollbar-thumb:hover { background: rgba(233,30,140,0.5); }
      `}</style>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const mounted = useHydrated()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // ✅ Local avatar preview — shows instantly after upload without
  //    waiting for the session to re-fetch from the server.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // ✅ FIX 1: Initialize form with empty strings — never use session data
  //    directly in useState() as session is null on server but populated
  //    on client, causing hydration mismatch
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
  })

  // ✅ FIX 2: Populate form once the session becomes available. This
  // synchronizes local editable form state with an external source (the
  // auth session), which only resolves after mount — a legitimate use of
  // an effect, not something derivable during render.
  useEffect(() => {
    if (session?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((prev) => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }))
      setAvatarUrl((prev) => prev ?? session.user.image ?? null)
    }
  }, [session])

  // ✅ FIX 5: Read the real role from the session instead of hardcoding
  //    'Customer' — session.user.role is set in the JWT/session callbacks
  //    in src/lib/auth.ts, so this now matches the "ADMIN" badge shown
  //    in the account dropdown / My Account page.
  const isAdmin = session?.user?.role === 'admin'

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ✅ FIX 6: Upload a real file to Cloudinary via /api/account/upload-avatar
  //    (any logged-in user, not just admin), persist it on User.avatar,
  //    then refresh the session so the navbar dropdown updates too —
  //    no re-login required.
  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/account/upload-avatar', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setAvatarUrl(data.url)
      await update({ image: data.url })
      toast.success('✅ Profile photo updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // ✅ FIX 7: Actually persist name/phone to MongoDB via
  //    /api/account/update — previously this only called next-auth's
  //    client-side update(), which never reached the database, so the
  //    name reverted on the next page load / login.
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch('/api/account/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')

      await update({ name: data.name })
      setSaved(true)
      toast.success('✅ Profile updated!')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setIsSaving(false)
    }
  }

  // ✅ FIX 3: Don't render session-dependent content until mounted
  if (!mounted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-surface)',
        }}
      />
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-surface)',
        paddingBottom: '5rem',
      }}
    >
      <div className="profile-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            href="/account"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-accent)',
              textDecoration: 'none',
              marginBottom: '1rem',
            }}
          >
            <ArrowLeft size={16} /> My Account
          </Link>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem,5vw,2.5rem)',
              color: 'var(--color-primary)',
              margin: '0 0 0.25rem',
            }}
          >
            My Profile
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            Manage your personal information
          </p>
        </div>

        {/* Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
          }}
          className="profile-layout"
        >
          {/* Avatar Card */}
          <div
            className="profile-avatar-card"
            style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(26,26,46,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.625rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '96px',
                height: '96px',
                marginBottom: '0.5rem',
              }}
            >
              {/* ✅ FIX 4: session?.user?.image now only renders after mount
                  so server always renders the fallback div — no mismatch */}
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid rgba(233,30,140,0.2)',
                    opacity: isUploadingAvatar ? 0.5 : 1,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, var(--color-accent), #c2185b)',
                    color: 'white',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '2rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid rgba(233,30,140,0.2)',
                    opacity: isUploadingAvatar ? 0.5 : 1,
                  }}
                >
                  {(form.name || 'U')[0].toUpperCase()}
                </div>
              )}
              {/* ✅ FIX 6: hidden file input triggered by the camera button */}
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="avatar-file-input"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  color: 'white',
                  border: '2px solid white',
                  cursor: isUploadingAvatar ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isUploadingAvatar ? (
                  <span className="spinner" style={{ width: 12, height: 12 }} />
                ) : (
                  <Camera size={14} />
                )}
              </label>
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                margin: 0,
              }}
            >
              {form.name || 'Your Name'}
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                margin: 0,
                overflowWrap: 'anywhere',
              }}
            >
              {form.email}
            </p>
            <span
              style={{
                display: 'inline-flex',
                padding: '0.2rem 0.75rem',
                background: isAdmin
                  ? 'rgba(217,119,6,0.1)'
                  : 'rgba(233,30,140,0.08)',
                color: isAdmin ? '#b45309' : 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: '9999px',
                border: isAdmin
                  ? '1px solid rgba(217,119,6,0.25)'
                  : '1px solid rgba(233,30,140,0.2)',
              }}
            >
              {isAdmin ? 'Admin' : 'Customer'}
            </span>
          </div>

          {/* Form Card */}
          <div
            className="profile-form-card"
            style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(26,26,46,0.06)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                margin: '0 0 1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(26,26,46,0.06)',
              }}
            >
              Personal Information
            </h2>

            <form
              onSubmit={handleSave}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              noValidate
            >
              {/* Full Name */}
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
              >
                <label
                  htmlFor="profile-name"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Full Name{' '}
                  <span style={{ color: 'var(--color-accent)' }}>*</span>
                </label>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <User
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      color: 'var(--color-text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    autoComplete="name"
                    suppressHydrationWarning
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 2.75rem',
                      border: '2px solid rgba(26,26,46,0.1)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                      background: 'white',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = 'var(--color-accent)')
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = 'rgba(26,26,46,0.1)')
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
              >
                <label
                  htmlFor="profile-email"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Email Address
                </label>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      color: 'var(--color-text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={form.email}
                    disabled
                    autoComplete="email"
                    suppressHydrationWarning
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 2.75rem',
                      border: '2px solid rgba(26,26,46,0.1)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      color: 'var(--color-text-muted)',
                      background: 'var(--color-surface)',
                      cursor: 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.78rem',
                    color: 'var(--color-text-muted)',
                    margin: 0,
                  }}
                >
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              {/* Phone */}
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
              >
                <label
                  htmlFor="profile-phone"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Phone Number
                </label>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Phone
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      color: 'var(--color-text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="profile-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+880 1XXX-XXXXXX"
                    autoComplete="tel"
                    suppressHydrationWarning
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 2.75rem',
                      border: '2px solid rgba(26,26,46,0.1)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                      background: 'white',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = 'var(--color-accent)')
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = 'rgba(26,26,46,0.1)')
                    }
                  />
                </div>
              </div>

              {/* Gender + DOB — stacked on mobile, side by side from tablet up */}
              <div className="profile-gender-dob-grid">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <label
                    htmlFor="profile-gender"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Gender
                  </label>
                  <Dropdown
                    value={form.gender}
                    onChange={(v) => setForm((prev) => ({ ...prev, gender: v }))}
                    options={GENDER_OPTIONS}
                    placeholder="Select gender"
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <label
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Date of Birth
                  </label>
                  <DatePicker
                    value={form.dob}
                    onChange={(v) => setForm((prev) => ({ ...prev, dob: v }))}
                  />
                </div>
              </div>

              {/* Actions */}
              <div
                className="profile-actions-row"
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  paddingTop: '0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="profile-btn-cancel"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    border: '2px solid var(--color-primary)',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  suppressHydrationWarning
                  className="profile-btn-save"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem 2rem',
                    background: saved ? '#16a34a' : 'var(--color-accent)',
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    border: 'none',
                    borderRadius: '9999px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.8 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {isSaving ? (
                    <>
                      <span
                        className="spinner"
                        style={{ width: 16, height: 16 }}
                      />{' '}
                      Saving…
                    </>
                  ) : saved ? (
                    <>
                      <Check size={16} /> Saved!
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <style>{`
          .profile-container {
            padding: 1.25rem 1rem 2rem;
          }
          .profile-avatar-card {
            padding: 1.5rem 1.25rem;
          }
          .profile-form-card {
            padding: 1.5rem 1.25rem;
          }
          .profile-gender-dob-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .profile-actions-row {
            flex-direction: column-reverse;
          }
          .profile-btn-cancel,
          .profile-btn-save {
            width: 100%;
          }

          @media (min-width: 480px) {
            .profile-gender-dob-grid {
              grid-template-columns: 1fr 1fr;
            }
            .profile-actions-row {
              flex-direction: row;
              justify-content: flex-end;
            }
            .profile-btn-cancel,
            .profile-btn-save {
              width: auto;
            }
          }

          @media (min-width: 640px) {
            .profile-container {
              padding: 2rem 1.5rem;
            }
            .profile-avatar-card {
              padding: 2rem 1.5rem;
            }
            .profile-form-card {
              padding: 2rem;
            }
          }

          @media (min-width: 768px) {
            .profile-layout { grid-template-columns: 240px 1fr !important; align-items: start; }
          }
        `}</style>
      </div>
    </div>
  )
}