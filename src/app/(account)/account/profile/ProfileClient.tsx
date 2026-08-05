'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Camera, Save, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
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

  // ✅ FIX 2: Populate form only after mount when session is available
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (session?.user) {
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
          paddingTop: '72px',
          minHeight: '100vh',
          background: 'var(--color-surface)',
        }}
      />
    )
  }

  return (
    <div
      style={{
        paddingTop: '72px',
        minHeight: '100vh',
        background: 'var(--color-surface)',
        paddingBottom: '5rem',
      }}
    >
      <div
        style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}
      >
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
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
              fontSize: 'clamp(1.75rem,4vw,2.5rem)',
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
            style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(26,26,46,0.06)',
              padding: '2rem 1.5rem',
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
                wordBreak: 'break-all',
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
            style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(26,26,46,0.06)',
              padding: '2rem',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                margin: '0 0 1.75rem',
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

              {/* Gender + DOB */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
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
                  <select
                    id="profile-gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    suppressHydrationWarning
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '2px solid rgba(26,26,46,0.1)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      color: 'var(--color-text-primary)',
                      background: 'white',
                      cursor: 'pointer',
                      outline: 'none',
                      appearance: 'none',
                    }}
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <label
                    htmlFor="profile-dob"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Date of Birth
                  </label>
                  <input
                    id="profile-dob"
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    suppressHydrationWarning
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '2px solid rgba(26,26,46,0.1)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      color: 'var(--color-text-primary)',
                      background: 'white',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'flex-end',
                  paddingTop: '0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => router.back()}
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
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
          @media (min-width: 768px) {
            .profile-layout { grid-template-columns: 240px 1fr !important; align-items: start; }
          }
        `}</style>
      </div>
    </div>
  )
}