'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Store, Truck, Share2, Bell, CreditCard,
  Search as SearchIcon, Globe, Save, RefreshCw,
  CheckCircle, AlertTriangle, Loader2, Phone,
  Facebook, Instagram,
  Youtube, X as TikTok, Shield, 
  Package,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────────────────

interface StoreSettings {
  name: string; tagline: string; email: string
  phone: string; address: string
  currency: string; currencySymbol: string
}
interface ShippingSettings {
  insideDhaka: number; outsideDhaka: number
  freeThreshold: number; expressExtra: number
}
interface SocialSettings {
  facebook: string; instagram: string
  youtube: string; tiktok: string
}
interface NotificationSettings {
  newOrderEmail: boolean; lowStockAlert: boolean
  lowStockThreshold: number; customerEmails: boolean
}
interface MaintenanceSettings {
  enabled: boolean; message: string
}
interface PaymentSettings {
  cod: boolean; bkash: boolean; nagad: boolean; card: boolean
  bkashNumber: string; nagadNumber: string
}
interface SeoSettings {
  metaTitle: string; metaDescription: string
  googleAnalytics: string; facebookPixel: string
}

interface AllSettings {
  store:         StoreSettings
  shipping:      ShippingSettings
  social:        SocialSettings
  notifications: NotificationSettings
  maintenance:   MaintenanceSettings
  payment:       PaymentSettings
  seo:           SeoSettings
}

// ── Helpers ────────────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, title, desc }: {
  icon: React.ElementType; title: string; desc: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
        background: 'linear-gradient(135deg, #e91e8c, #f43f5e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(233,30,140,0.3)',
      }}>
        <Icon size={18} color="white" strokeWidth={2} />
      </div>
      <div>
        <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</p>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>{desc}</p>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>{hint}</p>}
    </div>
  )
}

function Input({
  value, onChange, placeholder, type = 'text', prefix, disabled,
}: {
  value: string | number; onChange: (v: string) => void
  placeholder?: string; type?: string; prefix?: string; disabled?: boolean
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {prefix && (
        <span style={{
          position: 'absolute', left: '12px', fontSize: '0.875rem',
          color: '#94a3b8', fontWeight: 600, pointerEvents: 'none',
        }}>{prefix}</span>
      )}
      <input
        type={type} value={value} disabled={disabled}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: `9px 12px 9px ${prefix ? '28px' : '12px'}`,
          border: '1.5px solid #e8edf5', borderRadius: '10px',
          fontSize: '0.875rem', color: disabled ? '#94a3b8' : '#1e293b',
          outline: 'none', background: disabled ? '#f8fafc' : 'white',
          boxSizing: 'border-box', cursor: disabled ? 'not-allowed' : 'text',
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = '#e91e8c' }}
        onBlur={e  => { e.target.style.borderColor = '#e8edf5' }}
      />
    </div>
  )
}

function Toggle({
  label, desc, checked, onChange, danger,
}: {
  label: string; desc?: string; checked: boolean
  onChange: (v: boolean) => void; danger?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', padding: '14px 16px', borderRadius: '12px',
      background: checked && danger ? 'rgba(239,68,68,0.04)' : '#f8fafc',
      border: `1.5px solid ${checked && danger ? 'rgba(239,68,68,0.2)' : '#f1f5f9'}`,
    }}>
      <div>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: danger ? (checked ? '#b91c1c' : '#0f172a') : '#0f172a', margin: 0 }}>
          {label}
        </p>
        {desc && <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: '46px', height: '25px', borderRadius: '12px', border: 'none',
          background: checked ? (danger ? '#ef4444' : '#e91e8c') : '#e2e8f0',
          cursor: 'pointer', position: 'relative', flexShrink: 0,
          transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: '3px',
          left: checked ? '24px' : '3px',
          width: '19px', height: '19px', borderRadius: '50%',
          background: 'white', transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'white', borderRadius: '20px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      padding: '24px',
    }}>
      {children}
    </div>
  )
}

function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '14px',
    }}
      className={`settings-grid-${cols}`}
    >
      {children}
    </div>
  )
}

function SaveBar({ saving, onSave, dirty }: {
  saving: boolean; onSave: () => void; dirty: boolean
}) {
  if (!dirty && !saving) return null
  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: '12px',
      background: '#0f172a', borderRadius: '16px',
      padding: '12px 20px', zIndex: 100,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      animation: 'slideUp 0.2s ease',
    }}>
      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
        You have unsaved changes
      </p>
      <button
        onClick={onSave} disabled={saving}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 18px', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(135deg, #e91e8c, #f43f5e)',
          color: 'white', fontSize: '0.875rem', fontWeight: 700,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.8 : 1,
        }}
      >
        {saving
          ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</>
          : <><Save size={14} /> Save All Changes</>}
      </button>
    </div>
  )
}

// ── Tab config ─────────────────────────────────────────────────────────────
const TABS = [
  { key: 'store',         label: 'Store',         icon: Store },
  { key: 'shipping',      label: 'Shipping',      icon: Truck },
  { key: 'payment',       label: 'Payment',       icon: CreditCard },
  { key: 'social',        label: 'Social',        icon: Share2 },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'seo',           label: 'SEO',           icon: Globe },
  { key: 'maintenance',   label: 'Maintenance',   icon: Shield },
]

// ── Main ───────────────────────────────────────────────────────────────────

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState('store')
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [dirty,     setDirty]     = useState(false)
  const [saved,     setSaved]     = useState(false)

  const [settings, setSettings] = useState<AllSettings>({
    store:         { name: '', tagline: '', email: '', phone: '', address: '', currency: 'BDT', currencySymbol: '৳' },
    shipping:      { insideDhaka: 60, outsideDhaka: 120, freeThreshold: 1500, expressExtra: 60 },
    social:        { facebook: '', instagram: '', youtube: '', tiktok: '' },
    notifications: { newOrderEmail: true, lowStockAlert: true, lowStockThreshold: 5, customerEmails: true },
    maintenance:   { enabled: false, message: '' },
    payment:       { cod: true, bkash: true, nagad: true, card: true, bkashNumber: '', nagadNumber: '' },
    seo:           { metaTitle: '', metaDescription: '', googleAnalytics: '', facebookPixel: '' },
  })

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings) setSettings(data.settings as AllSettings)
    } catch { toast.error('Failed to load settings') }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const update = <K extends keyof AllSettings>(
    section: K,
    field: keyof AllSettings[K],
    value: unknown
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
    setDirty(true)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(settings).map(([key, value]) =>
          fetch('/api/admin/settings', {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ key, value }),
          })
        )
      )
      setDirty(false)
      setSaved(true)
      toast.success('✅ Settings saved!')
      setTimeout(() => setSaved(false), 3000)
    } catch { toast.error('Failed to save settings') }
    finally  { setSaving(false) }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #f1f5f9', borderTopColor: '#e91e8c', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Loading settings…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
            Settings
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0' }}>
            Manage your store configuration and preferences
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {saved && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#15803d', fontSize: '0.82rem', fontWeight: 600 }}>
              <CheckCircle size={14} /> Saved
            </div>
          )}
          <button onClick={fetchSettings} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleSave} disabled={saving || !dirty}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', border: 'none', background: dirty ? 'linear-gradient(135deg, #e91e8c, #f43f5e)' : '#e2e8f0', color: dirty ? 'white' : '#94a3b8', fontSize: '0.875rem', fontWeight: 700, cursor: (saving || !dirty) ? 'not-allowed' : 'pointer', boxShadow: dirty ? '0 4px 14px rgba(233,30,140,0.35)' : 'none' }}
          >
            {saving
              ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</>
              : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none', background: 'white', padding: '6px', borderRadius: '16px', border: '1px solid #f1f5f9', flexShrink: 0 }}>
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '8px 16px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
                background: active ? 'linear-gradient(135deg, #e91e8c, #f43f5e)' : 'transparent',
                color: active ? 'white' : '#64748b',
                boxShadow: active ? '0 2px 8px rgba(233,30,140,0.3)' : 'none',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Store Info ─────────────────────────────────────────────── */}
      {activeTab === 'store' && (
        <Card>
          <SectionTitle icon={Store} title="Store Information" desc="Basic details about your store" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Grid>
              <Field label="Store Name">
                <Input value={settings.store.name} onChange={v => update('store', 'name', v)} placeholder="BagBliss BD" />
              </Field>
              <Field label="Currency Symbol">
                <Input value={settings.store.currencySymbol} onChange={v => update('store', 'currencySymbol', v)} placeholder="৳" />
              </Field>
            </Grid>
            <Field label="Tagline">
              <Input value={settings.store.tagline} onChange={v => update('store', 'tagline', v)} placeholder="Bangladesh's most trendy mini crossbody bag store" />
            </Field>
            <Grid>
              <Field label="Contact Email">
                <Input value={settings.store.email} onChange={v => update('store', 'email', v)} placeholder="hello@bagbliss.com.bd" type="email" prefix="✉" />
              </Field>
              <Field label="Contact Phone">
                <Input value={settings.store.phone} onChange={v => update('store', 'phone', v)} placeholder="+880 1XXX-XXXXXX" prefix="📞" />
              </Field>
            </Grid>
            <Field label="Store Address">
              <Input value={settings.store.address} onChange={v => update('store', 'address', v)} placeholder="Dhaka, Bangladesh" prefix="📍" />
            </Field>
          </div>
        </Card>
      )}

      {/* ── Shipping ───────────────────────────────────────────────── */}
      {activeTab === 'shipping' && (
        <Card>
          <SectionTitle icon={Truck} title="Shipping & Delivery" desc="Configure delivery fees and thresholds" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Grid>
              <Field label="Inside Dhaka (৳)" hint="Standard delivery fee inside Dhaka">
                <Input type="number" value={settings.shipping.insideDhaka} onChange={v => update('shipping', 'insideDhaka', Number(v))} placeholder="60" prefix="৳" />
              </Field>
              <Field label="Outside Dhaka (৳)" hint="Standard delivery fee outside Dhaka">
                <Input type="number" value={settings.shipping.outsideDhaka} onChange={v => update('shipping', 'outsideDhaka', Number(v))} placeholder="120" prefix="৳" />
              </Field>
            </Grid>
            <Grid>
              <Field label="Free Shipping Threshold (৳)" hint="Orders above this amount get free shipping">
                <Input type="number" value={settings.shipping.freeThreshold} onChange={v => update('shipping', 'freeThreshold', Number(v))} placeholder="1500" prefix="৳" />
              </Field>
              <Field label="Express Extra Fee (৳)" hint="Extra charge on top of standard for express delivery">
                <Input type="number" value={settings.shipping.expressExtra} onChange={v => update('shipping', 'expressExtra', Number(v))} placeholder="60" prefix="৳" />
              </Field>
            </Grid>

            {/* Preview */}
            <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', marginTop: '4px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Preview</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {[
                  { label: 'Inside Dhaka',    value: `৳${settings.shipping.insideDhaka}` },
                  { label: 'Outside Dhaka',   value: `৳${settings.shipping.outsideDhaka}` },
                  { label: 'Express Extra',   value: `৳${settings.shipping.expressExtra}` },
                  { label: 'Free Shipping',   value: `Over ৳${settings.shipping.freeThreshold}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '10px 12px', borderRadius: '10px', background: 'white', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '0 0 4px', fontWeight: 600 }}>{label}</p>
                    <p style={{ fontSize: '1rem', fontWeight: 800, color: '#e91e8c', margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Payment ────────────────────────────────────────────────── */}
      {activeTab === 'payment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Card>
            <SectionTitle icon={CreditCard} title="Payment Methods" desc="Enable or disable payment options at checkout" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Toggle label="Cash on Delivery" desc="Customers pay when order is delivered" checked={settings.payment.cod} onChange={v => update('payment', 'cod', v)} />
              <Toggle label="bKash" desc="Mobile banking via bKash gateway" checked={settings.payment.bkash} onChange={v => update('payment', 'bkash', v)} />
              <Toggle label="Nagad" desc="Mobile banking via Nagad gateway" checked={settings.payment.nagad} onChange={v => update('payment', 'nagad', v)} />
              <Toggle label="Card Payment" desc="Visa / Mastercard via SSLCommerz" checked={settings.payment.card} onChange={v => update('payment', 'card', v)} />
            </div>
          </Card>

          <Card>
            <SectionTitle icon={Phone} title="Mobile Banking Numbers" desc="Your bKash and Nagad merchant numbers" />
            <Grid>
              <Field label="bKash Number" hint="Customers send payment to this number">
                <Input value={settings.payment.bkashNumber} onChange={v => update('payment', 'bkashNumber', v)} placeholder="01XXXXXXXXX" prefix="📱" />
              </Field>
              <Field label="Nagad Number" hint="Customers send payment to this number">
                <Input value={settings.payment.nagadNumber} onChange={v => update('payment', 'nagadNumber', v)} placeholder="01XXXXXXXXX" prefix="📱" />
              </Field>
            </Grid>
          </Card>
        </div>
      )}

      {/* ── Social ─────────────────────────────────────────────────── */}
      {activeTab === 'social' && (
        <Card>
          <SectionTitle icon={Share2} title="Social Media Links" desc="Your social profiles shown in the footer" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'facebook',  label: 'Facebook Page URL',  icon: Facebook,  placeholder: 'https://facebook.com/bagblissbd',  color: '#1877f2' },
              { key: 'instagram', label: 'Instagram Profile URL', icon: Instagram, placeholder: 'https://instagram.com/bagblissbd', color: '#e1306c' },
              { key: 'youtube',   label: 'YouTube Channel URL', icon: Youtube,   placeholder: 'https://youtube.com/@bagblissbd',  color: '#ff0000' },
              { key: 'tiktok',    label: 'TikTok Profile URL',  icon: TikTok,    placeholder: 'https://tiktok.com/@bagblissbd',   color: '#000000' },
            ].map(({ key, label, icon: Icon, placeholder, color }) => (
              <Field key={key} label={label}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    position: 'absolute', left: '12px', width: '20px', height: '20px',
                    borderRadius: '6px', background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <Icon size={11} color="white" />
                  </div>
                  <input
                    type="url" value={settings.social[key as keyof SocialSettings]}
                    onChange={e => update('social', key as keyof SocialSettings, e.target.value)}
                    placeholder={placeholder}
                    style={{ width: '100%', padding: '9px 12px 9px 40px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                    onFocus={e => (e.target.style.borderColor = '#e91e8c')}
                    onBlur={e  => (e.target.style.borderColor = '#e8edf5')}
                  />
                </div>
              </Field>
            ))}
          </div>
        </Card>
      )}

      {/* ── Notifications ──────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <Card>
          <SectionTitle icon={Bell} title="Notifications" desc="Control email and alert preferences" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Toggle
              label="New Order Email"
              desc="Receive an email when a new order is placed"
              checked={settings.notifications.newOrderEmail}
              onChange={v => update('notifications', 'newOrderEmail', v)}
            />
            <Toggle
              label="Customer Order Emails"
              desc="Send order confirmation emails to customers"
              checked={settings.notifications.customerEmails}
              onChange={v => update('notifications', 'customerEmails', v)}
            />
            <Toggle
              label="Low Stock Alerts"
              desc="Get notified when product stock is running low"
              checked={settings.notifications.lowStockAlert}
              onChange={v => update('notifications', 'lowStockAlert', v)}
            />
            {settings.notifications.lowStockAlert && (
              <div style={{ marginLeft: '0', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <Field label="Low Stock Threshold" hint="Alert when stock falls below this number">
                  <div style={{ maxWidth: '200px' }}>
                    <Input
                      type="number" value={settings.notifications.lowStockThreshold}
                      onChange={v => update('notifications', 'lowStockThreshold', Number(v))}
                      placeholder="5" prefix="📦"
                    />
                  </div>
                </Field>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── SEO ────────────────────────────────────────────────────── */}
      {activeTab === 'seo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Card>
            <SectionTitle icon={SearchIcon} title="SEO Settings" desc="Improve your store's search engine visibility" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Field label="Meta Title" hint="Shown in browser tab and Google search results (60 chars max)">
                <Input value={settings.seo.metaTitle} onChange={v => update('seo', 'metaTitle', v)} placeholder="BagBliss BD — Premium Mini Crossbody Bags Bangladesh" />
                <p style={{ fontSize: '0.68rem', color: settings.seo.metaTitle.length > 60 ? '#ef4444' : '#94a3b8', margin: '4px 0 0', textAlign: 'right' }}>
                  {settings.seo.metaTitle.length}/60
                </p>
              </Field>

              <Field label="Meta Description" hint="Shown in Google search results (160 chars max)">
                <textarea
                  value={settings.seo.metaDescription}
                  onChange={e => update('seo', 'metaDescription', e.target.value)}
                  placeholder="Bangladesh's most trendy mini crossbody bag store. Shop premium imported bags."
                  rows={3}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8edf5', borderRadius: '10px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: 'white', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#e91e8c')}
                  onBlur={e  => (e.target.style.borderColor = '#e8edf5')}
                />
                <p style={{ fontSize: '0.68rem', color: settings.seo.metaDescription.length > 160 ? '#ef4444' : '#94a3b8', margin: '4px 0 0', textAlign: 'right' }}>
                  {settings.seo.metaDescription.length}/160
                </p>
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle icon={Globe} title="Analytics & Tracking" desc="Add tracking codes for analytics" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Field label="Google Analytics Measurement ID" hint="Format: G-XXXXXXXXXX">
                <Input value={settings.seo.googleAnalytics} onChange={v => update('seo', 'googleAnalytics', v)} placeholder="G-XXXXXXXXXX" />
              </Field>
              <Field label="Facebook Pixel ID" hint="Your Facebook Pixel ID for ad tracking">
                <Input value={settings.seo.facebookPixel} onChange={v => update('seo', 'facebookPixel', v)} placeholder="XXXXXXXXXXXXXXXXXX" />
              </Field>
            </div>
          </Card>
        </div>
      )}

      {/* ── Maintenance ────────────────────────────────────────────── */}
      {activeTab === 'maintenance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Card>
            <SectionTitle icon={Shield} title="Maintenance Mode" desc="Temporarily take your store offline" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Toggle
                label="Enable Maintenance Mode"
                desc="When enabled, customers see a maintenance message instead of your store"
                checked={settings.maintenance.enabled}
                onChange={v => update('maintenance', 'enabled', v)}
                danger
              />

              {settings.maintenance.enabled && (
                <div style={{ padding: '16px', background: 'rgba(239,68,68,0.04)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <AlertTriangle size={15} color="#ef4444" />
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b91c1c', margin: 0 }}>
                      Your store is currently offline to customers
                    </p>
                  </div>
                  <Field label="Maintenance Message">
                    <textarea
                      value={settings.maintenance.message}
                      onChange={e => update('maintenance', 'message', e.target.value)}
                      placeholder="We are updating the store. Back shortly!"
                      rows={2}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: '10px', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: 'white', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </Field>
                </div>
              )}
            </div>
          </Card>

          {/* Store health */}
          <Card>
            <SectionTitle icon={Package} title="Store Health" desc="Quick overview of your store status" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              {[
                { label: 'Store Status',   value: settings.maintenance.enabled ? 'Offline' : 'Online', ok: !settings.maintenance.enabled },
                { label: 'COD',            value: settings.payment.cod    ? 'Enabled' : 'Disabled', ok: settings.payment.cod },
                { label: 'bKash',          value: settings.payment.bkash  ? 'Enabled' : 'Disabled', ok: settings.payment.bkash },
                { label: 'Free Shipping',  value: `Over ৳${settings.shipping.freeThreshold}`,      ok: true },
              ].map(({ label, value, ok }) => (
                <div key={label} style={{ padding: '14px', borderRadius: '12px', background: ok ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '0 0 6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: ok ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: ok ? '#15803d' : '#b91c1c', margin: 0 }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Floating save bar */}
      <SaveBar saving={saving} onSave={handleSave} dirty={dirty} />

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @media (max-width: 600px) {
          .settings-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}