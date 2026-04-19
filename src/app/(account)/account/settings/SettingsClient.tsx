'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import {
  Bell, Shield, Globe, Moon,
  LogOut, Trash2, ArrowLeft,
  Check, Eye, EyeOff, Mail,
  MessageSquare, Zap, BarChart2,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} role="switch" aria-checked={checked}
      style={{
        width: '48px', height: '26px', borderRadius: '13px', border: 'none',
        background: checked ? 'var(--color-accent)' : 'rgba(26,26,46,0.15)',
        cursor: 'pointer', position: 'relative', transition: 'background 0.3s ease',
        flexShrink: 0,
      }}>
      <span style={{
        position: 'absolute', top: '3px',
        left: checked ? '25px' : '3px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: 'white', transition: 'left 0.3s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

function SettingRow({ icon, label, desc, right }: {
  icon?: React.ReactNode; label: string; desc: string; right: React.ReactNode
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '1rem', padding: '1rem 1.5rem',
      borderBottom: '1px solid rgba(26,26,46,0.04)',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,26,46,0.02)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
        {icon && <div style={{ marginTop: '2px', flexShrink: 0 }}>{icon}</div>}
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)', margin: '0 0 0.2rem' }}>
            {label}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
            {desc}
          </p>
        </div>
      </div>
      {right}
    </div>
  )
}

function SectionCard({ icon, title, iconColor = '#E91E8C', danger = false, children }: {
  icon: React.ReactNode; title: string; iconColor?: string; danger?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{
      background: 'white', borderRadius: 'var(--radius-xl)',
      border: `1px solid ${danger ? 'rgba(239,68,68,0.15)' : 'rgba(26,26,46,0.06)'}`,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(26,26,46,0.06)',
        background: 'var(--color-surface)',
      }}>
        <span style={{ color: iconColor }}>{icon}</span>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600,
          color: danger ? 'var(--color-error)' : 'var(--color-primary)', margin: 0,
        }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    orderUpdates: true, flashSale: true, newsletter: false, sms: true,
  })
  const [privacy, setPrivacy] = useState({ showProfile: false, dataSaving: true })
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('en')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false })
  const [isSavingPw, setIsSavingPw] = useState(false)

  const toggle = (group: 'notifications' | 'privacy', key: string) => {
    if (group === 'notifications') setNotifications(p => ({ ...p, [key]: !p[key as keyof typeof p] }))
    else setPrivacy(p => ({ ...p, [key]: !p[key as keyof typeof p] }))
    toast.success('Setting updated')
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPw.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    setIsSavingPw(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('✅ Password updated!')
    setIsSavingPw(false)
    setShowPasswordForm(false)
    setPwForm({ current: '', newPw: '', confirm: '' })
  }

  const pwInputStyle = {
    width: '100%', padding: '0.8rem 2.75rem 0.8rem 1rem',
    border: '2px solid rgba(26,26,46,0.1)', borderRadius: '0.75rem',
    fontFamily: 'var(--font-body)', fontSize: '0.9rem',
    color: 'var(--color-text-primary)', background: 'white', outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'var(--color-surface)', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/account" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
            color: 'var(--color-accent)', textDecoration: 'none', marginBottom: '1rem',
          }}>
            <ArrowLeft size={16} /> My Account
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.5rem)', color: 'var(--color-primary)', margin: '0 0 0.25rem' }}>
            Settings
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Manage your account preferences
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ── Notifications ── */}
          <SectionCard icon={<Bell size={20} />} title="Notifications">
            <div>
              <SettingRow
                icon={<Zap size={15} color="var(--color-accent)" />}
                label="Order Updates"
                desc="Get notified when your order status changes"
                right={<ToggleSwitch checked={notifications.orderUpdates} onChange={() => toggle('notifications', 'orderUpdates')} />}
              />
              <SettingRow
                icon={<Zap size={15} color="var(--color-gold)" />}
                label="Flash Sale Alerts"
                desc="Be first to know about flash deals"
                right={<ToggleSwitch checked={notifications.flashSale} onChange={() => toggle('notifications', 'flashSale')} />}
              />
              <SettingRow
                icon={<Mail size={15} color="var(--color-accent)" />}
                label="Newsletter"
                desc="Weekly style tips and new arrivals"
                right={<ToggleSwitch checked={notifications.newsletter} onChange={() => toggle('notifications', 'newsletter')} />}
              />
              <SettingRow
                icon={<MessageSquare size={15} color="var(--color-accent)" />}
                label="SMS Notifications"
                desc="Receive order alerts via SMS"
                right={<ToggleSwitch checked={notifications.sms} onChange={() => toggle('notifications', 'sms')} />}
              />
            </div>
          </SectionCard>

          {/* ── Security ── */}
          <SectionCard icon={<Shield size={20} />} title="Security">
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)', margin: '0 0 0.2rem' }}>Password</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>Last changed: Never</p>
                </div>
                <button onClick={() => setShowPasswordForm(!showPasswordForm)} style={{
                  padding: '0.4rem 1rem', background: 'none',
                  border: '2px solid rgba(26,26,46,0.1)', borderRadius: '9999px',
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 700,
                  color: 'var(--color-primary)', cursor: 'pointer',
                }}>
                  {showPasswordForm ? 'Cancel' : 'Change'}
                </button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} style={{
                  background: 'var(--color-surface)', borderRadius: '1rem',
                  padding: '1.25rem', display: 'flex', flexDirection: 'column',
                  gap: '1rem', border: '1px solid rgba(26,26,46,0.08)',
                  animation: 'fadeIn 0.3s ease',
                }}>
                  {(['current', 'newPw', 'confirm'] as const).map((field) => (
                    <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {field === 'current' ? 'Current Password' : field === 'newPw' ? 'New Password' : 'Confirm Password'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPw[field] ? 'text' : 'password'}
                          value={pwForm[field]}
                          onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                          placeholder={field === 'newPw' ? 'Min 8 characters' : '••••••••'}
                          required minLength={field === 'newPw' ? 8 : undefined}
                          style={pwInputStyle}
                          onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(26,26,46,0.1)'}
                        />
                        <button type="button"
                          onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
                          style={{
                            position: 'absolute', right: '0.75rem', top: '50%',
                            transform: 'translateY(-50%)', background: 'none', border: 'none',
                            cursor: 'pointer', color: 'var(--color-text-muted)',
                            display: 'flex', alignItems: 'center',
                          }}>
                          {showPw[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={isSavingPw} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    width: '100%', padding: '0.875rem',
                    background: 'var(--color-accent)', color: 'white',
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem',
                    border: 'none', borderRadius: '9999px',
                    cursor: isSavingPw ? 'not-allowed' : 'pointer', opacity: isSavingPw ? 0.8 : 1,
                  }}>
                    {isSavingPw
                      ? <span className="spinner" style={{ width: 16, height: 16 }} />
                      : <><Check size={16} /> Update Password</>}
                  </button>
                </form>
              )}
            </div>
          </SectionCard>

          {/* ── Preferences ── */}
          <SectionCard icon={<Globe size={20} />} title="Preferences">
            <div>
              <SettingRow
                icon={<Moon size={15} color="var(--color-primary)" />}
                label="Dark Mode"
                desc="Switch to dark theme (coming soon)"
                right={
                  <ToggleSwitch checked={darkMode} onChange={() => { setDarkMode(!darkMode); toast('🌙 Coming soon!') }} />
                }
              />
              <SettingRow
                icon={<Globe size={15} color="var(--color-accent)" />}
                label="Language"
                desc="Choose your preferred language"
                right={
                  <select value={language}
                    onChange={e => { setLanguage(e.target.value); toast.success('Language preference saved') }}
                    style={{
                      padding: '0.4rem 0.75rem',
                      border: '2px solid rgba(26,26,46,0.1)', borderRadius: '0.5rem',
                      fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                      color: 'var(--color-text-primary)', background: 'white',
                      cursor: 'pointer', outline: 'none',
                    }}>
                    <option value="en">English</option>
                    <option value="bn">বাংলা</option>
                  </select>
                }
              />
              <SettingRow
                icon={<BarChart2 size={15} color="var(--color-accent)" />}
                label="Data Saving Mode"
                desc="Reduce image quality to save data"
                right={<ToggleSwitch checked={privacy.dataSaving} onChange={() => toggle('privacy', 'dataSaving')} />}
              />
            </div>
          </SectionCard>

          {/* ── Danger Zone ── */}
          <SectionCard icon={<Trash2 size={20} />} title="Danger Zone" iconColor="#ef4444" danger>
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0' }}>

              {/* Sign Out */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '1rem', padding: '0.875rem 0',
                borderBottom: '1px solid rgba(239,68,68,0.08)', flexWrap: 'wrap',
              }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)', margin: '0 0 0.2rem' }}>Sign Out</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Sign out from your account on this device
                  </p>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/' })} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1.125rem', background: 'none',
                  border: '2px solid rgba(26,26,46,0.15)', borderRadius: '9999px',
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 700,
                  color: 'var(--color-primary)', cursor: 'pointer',
                }}>
                  <LogOut size={15} /> Sign Out
                </button>
              </div>

              {/* Delete Account */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '1rem', padding: '0.875rem 0', flexWrap: 'wrap',
              }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-error)', margin: '0 0 0.2rem' }}>Delete Account</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Permanently delete your account and all data
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure? This cannot be undone.')) {
                      toast.error('Account deletion request sent. Contact support.')
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 1.125rem', background: 'none',
                    border: '2px solid rgba(239,68,68,0.3)', borderRadius: '9999px',
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 700,
                    color: 'var(--color-error)', cursor: 'pointer',
                  }}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  )
}