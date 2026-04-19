'use client'

import { useState } from 'react'
import {
  MapPin, Plus, Edit2, Trash2, ArrowLeft,
  Home, Briefcase, Check, X,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Address {
  id: string
  label: 'Home' | 'Work' | 'Other'
  fullName: string
  phone: string
  division: string
  district: string
  thana: string
  address: string
  postalCode: string
  isDefault: boolean
}

// ── Fix: type the form state explicitly ──
interface AddressForm {
  label: 'Home' | 'Work' | 'Other'
  fullName: string
  phone: string
  division: string
  district: string
  thana: string
  address: string
  postalCode: string
  isDefault: boolean
}

const DIVISIONS = ['Dhaka','Chittagong','Rajshahi','Khulna','Barisal','Sylhet','Rangpur','Mymensingh']

const EMPTY_FORM: AddressForm = {
  label: 'Home',
  fullName: '', phone: '', division: '',
  district: '', thana: '', address: '',
  postalCode: '', isDefault: false,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.8rem 1rem',
  border: '2px solid rgba(26,26,46,0.1)',
  borderRadius: '0.75rem',
  fontFamily: 'var(--font-body)', fontSize: '0.9rem',
  color: 'var(--color-text-primary)', background: 'white',
  outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: '0.82rem',
  fontWeight: 700, color: 'var(--color-text-primary)',
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1', label: 'Home', fullName: 'Morshed',
      phone: '01785286936', division: 'Dhaka', district: 'Dhaka',
      thana: 'Gulshan', address: 'Sector 10, Road 11',
      postalCode: '1230', isDefault: true,
    },
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true) }

  const openEdit = (addr: Address) => {
    setForm({
      label: addr.label, fullName: addr.fullName, phone: addr.phone,
      division: addr.division, district: addr.district, thana: addr.thana,
      address: addr.address, postalCode: addr.postalCode, isDefault: addr.isDefault,
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this address?')) return
    setAddresses(prev => prev.filter(a => a.id !== id))
    toast.success('Address deleted')
  }

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
    toast.success('Default address updated')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.phone || !form.address || !form.division) {
      toast.error('Please fill required fields'); return
    }
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 600))
    if (editingId) {
      setAddresses(prev => prev.map(a =>
        a.id === editingId ? { ...a, ...form } :
        form.isDefault ? { ...a, isDefault: false } : a
      ))
      toast.success('✅ Address updated!')
    } else {
      const newAddr: Address = { id: Date.now().toString(), ...form }
      setAddresses(prev => {
        const updated = form.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev
        return [...updated, newAddr]
      })
      toast.success('✅ Address added!')
    }
    setIsSaving(false); setShowForm(false); setEditingId(null)
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
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.5rem)', color: 'var(--color-primary)', margin: '0 0 0.25rem' }}>
                Saved Addresses
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                {addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}
              </p>
            </div>
            {!showForm && (
              <button onClick={openAdd} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.625rem 1.25rem', background: 'var(--color-accent)',
                color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700,
                fontSize: '0.875rem', border: 'none', borderRadius: '9999px', cursor: 'pointer',
              }}>
                <Plus size={16} /> Add New
              </button>
            )}
          </div>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div style={{
            background: 'white', borderRadius: 'var(--radius-xl)',
            border: '2px solid rgba(233,30,140,0.15)',
            padding: '2rem', marginBottom: '1.5rem',
          }}>
            {/* Form Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '1.5rem', paddingBottom: '1rem',
              borderBottom: '1px solid rgba(26,26,46,0.06)',
            }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)', margin: 0 }}>
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(26,26,46,0.06)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--color-text-muted)',
              }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Address Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Address Type</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(['Home', 'Work', 'Other'] as const).map(lbl => (
                    <button key={lbl} type="button"
                      onClick={() => setForm(prev => ({ ...prev, label: lbl }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem',
                        border: `2px solid ${form.label === lbl ? 'var(--color-accent)' : 'rgba(26,26,46,0.1)'}`,
                        borderRadius: '9999px',
                        background: form.label === lbl ? 'var(--color-accent)' : 'white',
                        color: form.label === lbl ? 'white' : 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      {lbl === 'Work' ? <Briefcase size={14} /> : <Home size={14} />}
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="addr-grid-resp">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Full Name <span style={{ color: 'var(--color-accent)' }}>*</span></label>
                  <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                    placeholder="Recipient's name" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(26,26,46,0.1)'} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Phone <span style={{ color: 'var(--color-accent)' }}>*</span></label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="01XXX-XXXXXX" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(26,26,46,0.1)'} />
                </div>
              </div>

              {/* Division + District + Thana */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }} className="addr-grid-3-resp">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Division <span style={{ color: 'var(--color-accent)' }}>*</span></label>
                  <select name="division" value={form.division} onChange={handleChange} required
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(26,26,46,0.1)'}>
                    <option value="">Select Division</option>
                    {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>District <span style={{ color: 'var(--color-accent)' }}>*</span></label>
                  <input type="text" name="district" value={form.district} onChange={handleChange}
                    placeholder="e.g. Dhaka" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(26,26,46,0.1)'} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Thana / Upazila</label>
                  <input type="text" name="thana" value={form.thana} onChange={handleChange}
                    placeholder="e.g. Gulshan" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(26,26,46,0.1)'} />
                </div>
              </div>

              {/* Full Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Full Address <span style={{ color: 'var(--color-accent)' }}>*</span></label>
                <input type="text" name="address" value={form.address} onChange={handleChange}
                  placeholder="House/Flat, Road, Area" required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(26,26,46,0.1)'} />
              </div>

              {/* Postal + Default */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="addr-grid-resp">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Postal Code</label>
                  <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange}
                    placeholder="e.g. 1212" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(26,26,46,0.1)'} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem', color: 'var(--color-text-secondary)',
                  }}>
                    <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)', cursor: 'pointer' }} />
                    Set as default address
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '0.75rem 1.5rem', background: 'transparent',
                  border: '2px solid var(--color-primary)', borderRadius: '9999px',
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem',
                  color: 'var(--color-primary)', cursor: 'pointer',
                }}>Cancel</button>
                <button type="submit" disabled={isSaving} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.875rem 2rem', background: 'var(--color-accent)',
                  color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700,
                  fontSize: '0.875rem', border: 'none', borderRadius: '9999px',
                  cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.8 : 1,
                }}>
                  {isSaving
                    ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</>
                    : editingId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center',
            gap: '1rem', background: 'white', borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(26,26,46,0.06)',
          }}>
            <MapPin size={48} color="#E91E8C" strokeWidth={1} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-primary)', margin: 0 }}>
              No addresses saved
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Add a delivery address to speed up your checkout.
            </p>
            <button onClick={openAdd} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 2rem', background: 'var(--color-accent)',
              color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700,
              fontSize: '0.875rem', border: 'none', borderRadius: '9999px', cursor: 'pointer',
            }}>
              <Plus size={16} /> Add Address
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {addresses.map(addr => (
              <div key={addr.id} style={{
                background: 'white', borderRadius: 'var(--radius-xl)',
                border: `1px solid ${addr.isDefault ? 'rgba(233,30,140,0.25)' : 'rgba(26,26,46,0.06)'}`,
                overflow: 'hidden', transition: 'box-shadow 0.2s ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,26,46,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* Card Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.25rem', background: 'var(--color-surface)',
                  borderBottom: '1px solid rgba(26,26,46,0.05)', gap: '0.75rem', flexWrap: 'wrap',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                    fontWeight: 700, color: 'var(--color-primary)',
                  }}>
                    {addr.label === 'Work'
                      ? <Briefcase size={15} color="var(--color-accent)" />
                      : <Home size={15} color="var(--color-accent)" />}
                    {addr.label}
                    {addr.isDefault && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.15rem 0.6rem',
                        background: 'rgba(233,30,140,0.1)', color: 'var(--color-accent)',
                        fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                        borderRadius: '9999px', border: '1px solid rgba(233,30,140,0.2)',
                      }}>
                        <Check size={10} /> Default
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefault(addr.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.35rem 0.75rem', background: 'white',
                        border: '1px solid rgba(26,26,46,0.1)', borderRadius: '9999px',
                        fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600,
                        color: 'var(--color-text-secondary)', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                      >
                        Set Default
                      </button>
                    )}
                    <button onClick={() => openEdit(addr)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'white', border: '1px solid rgba(26,26,46,0.1)',
                      cursor: 'pointer', color: 'var(--color-text-secondary)',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(addr.id)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'white', border: '1px solid rgba(26,26,46,0.1)',
                      cursor: 'pointer', color: 'var(--color-error)',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)', margin: 0 }}>
                    {addr.fullName}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {addr.phone}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                    {addr.address}{addr.thana ? `, ${addr.thana}` : ''}, {addr.district}, {addr.division}{addr.postalCode ? ` – ${addr.postalCode}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <style>{`
          @media (max-width: 640px) {
            .addr-grid-resp { grid-template-columns: 1fr !important; }
            .addr-grid-3-resp { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  )
}