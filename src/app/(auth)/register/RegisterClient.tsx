'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ShoppingBag, Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Schema ────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase and number'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

// ── Google Icon ───────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

// ── Facebook Icon ─────────────────────────────────────────────────────────
function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="white" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function RegisterClient() {
  const router = useRouter()

  const [showPassword,    setShowPassword]    = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [isLoading,       setIsLoading]       = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isFbLoading,     setIsFbLoading]     = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const anyLoading = isLoading || isGoogleLoading || isFbLoading

  // ── Email Register ────────────────────────────────────────────────────
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const res    = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error ?? 'Registration failed')
        return
      }

      toast.success('Account created! Signing you in… 🎉')

      const signInResult = await signIn('credentials', {
        email:    data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        router.push('/login')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Google ────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch {
      toast.error('Google sign up failed. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  // ── Facebook ──────────────────────────────────────────────────────────
  const handleFacebook = async () => {
    setIsFbLoading(true)
    try {
      await signIn('facebook', { callbackUrl: '/' })
    } catch {
      toast.error('Facebook sign up failed. Please try again.')
      setIsFbLoading(false)
    }
  }

  return (
    <div className="auth-page">

      {/* ── Left decorative panel ──────────────────────────────────── */}
      <div className="auth-panel">
        <div className="auth-panel-content">
          <ShoppingBag size={48} color="white" strokeWidth={1.5} />
          <h1>Join BagBliss BD</h1>
          <p>
            Create your free account and start shopping Bangladesh&apos;s most
            trendy mini crossbody bags today.
          </p>
          <div className="auth-features">
            <div className="auth-feature">🎁 Welcome discount on first order</div>
            <div className="auth-feature">📦 Track all your orders</div>
            <div className="auth-feature">💝 Save items to wishlist</div>
            <div className="auth-feature">🔔 Get exclusive sale alerts</div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ───────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-container">

          {/* Header */}
          <div className="auth-form-header">
            <h2>Create Account</h2>
            <p>Join thousands of happy shoppers</p>
          </div>

          {/* ── Google button ─────────────────────────────────────── */}
          <button
            onClick={handleGoogle}
            disabled={anyLoading}
            className="btn-google"
          >
            {isGoogleLoading ? <span className="spinner" /> : <GoogleIcon />}
            {isGoogleLoading ? 'Connecting…' : 'Continue with Google'}
          </button>

          {/* ── Facebook button ───────────────────────────────────── */}
          <button
            onClick={handleFacebook}
            disabled={anyLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '0.875rem 1.5rem',
              marginTop: '0.75rem',
              background: '#1877f2',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: 'white',
              cursor: anyLoading ? 'not-allowed' : 'pointer',
              opacity: anyLoading ? 0.75 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {isFbLoading ? <span className="spinner" /> : <FacebookIcon />}
            {isFbLoading ? 'Connecting…' : 'Continue with Facebook'}
          </button>

          {/* Divider */}
          <div className="auth-divider">
            <span>or register with email</span>
          </div>

          {/* ── Email form ─────────────────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Your full name"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="your@email.com"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 chars, uppercase & number"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="password-toggle"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={anyLoading}
              className="btn-primary w-full"
              style={{ justifyContent: 'center' }}
            >
              {isLoading
                ? <><span className="spinner" /> Creating account…</>
                : 'Create Free Account'}
            </button>
          </form>

          {/* Terms */}
          <p className="auth-terms">
            By creating an account, you agree to our{' '}
            <Link href="/terms" style={{ color: 'var(--color-accent)' }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" style={{ color: 'var(--color-accent)' }}>
              Privacy Policy
            </Link>
          </p>

          {/* Login link */}
          <p className="auth-switch">
            Already have an account?{' '}
            <Link href="/login" className="auth-switch-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}