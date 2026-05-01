'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ShoppingBag, Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'

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
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

// ── Client-only Google Button ─────────────────
// Rendered only after mount so browser extensions can never cause
// a server/client attribute mismatch on this element
function GoogleButton({
  onClick,
  isLoading,
}: {
  onClick: () => void
  isLoading: boolean
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div
        className="btn-google"
        style={{ opacity: 0, pointerEvents: 'none', visibility: 'hidden' }}
        aria-hidden="true"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="btn-google"
      aria-label="Continue with Google"
      suppressHydrationWarning
    >
      {isLoading ? (
        <span className="spinner" />
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      {isLoading ? 'Connecting...' : 'Continue with Google'}
    </button>
  )
}

// ── Register Page ─────────────────────────────
export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Registration failed')
        return
      }

      toast.success('Account created! Signing you in... 🎉')

      const signInResult = await signIn('credentials', {
        email: data.email,
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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch {
      toast.error('Google login failed. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="auth-page" suppressHydrationWarning>
      {/* Left — Decorative Panel */}
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

      {/* Right — Register Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Create Account</h2>
            <p>Join thousands of happy shoppers</p>
          </div>

          {/* ✅ Client-only — never SSR'd, extensions can't inject attributes */}
          <GoogleButton onClick={handleGoogleLogin} isLoading={isGoogleLoading} />

          <div className="auth-divider">
            <span>or register with email</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Full Name
              </label>
              <div className="input-wrapper" suppressHydrationWarning>
                <User className="input-icon" size={18} aria-hidden="true" />
                <input
                  {...register('name')}
                  id="register-name"
                  type="text"
                  placeholder="Your full name"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  autoComplete="name"
                  suppressHydrationWarning
                />
              </div>
              {errors.name && (
                <span className="error-message" role="alert">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                Email Address
              </label>
              <div className="input-wrapper" suppressHydrationWarning>
                <Mail className="input-icon" size={18} aria-hidden="true" />
                <input
                  {...register('email')}
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  autoComplete="email"
                  suppressHydrationWarning
                />
              </div>
              {errors.email && (
                <span className="error-message" role="alert">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                Password
              </label>
              <div
                className="input-wrapper"
                style={{ position: 'relative' }}
                suppressHydrationWarning
              >
                <Lock className="input-icon" size={18} aria-hidden="true" />
                <input
                  {...register('password')}
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 chars, uppercase & number"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  autoComplete="new-password"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  suppressHydrationWarning
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="error-message" role="alert">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm">
                Confirm Password
              </label>
              <div
                className="input-wrapper"
                style={{ position: 'relative' }}
                suppressHydrationWarning
              >
                <Lock className="input-icon" size={18} aria-hidden="true" />
                <input
                  {...register('confirmPassword')}
                  id="register-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  autoComplete="new-password"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="password-toggle"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  suppressHydrationWarning
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message" role="alert">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
              style={{ justifyContent: 'center' }}
              suppressHydrationWarning
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Creating account...
                </>
              ) : (
                'Create Free Account'
              )}
            </button>
          </form>

          <div className="auth-terms">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="auth-switch-link">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="auth-switch-link">
              Privacy Policy
            </Link>
          </div>

          <div className="auth-switch">
            Already have an account?{' '}
            <Link href="/login" className="auth-switch-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}