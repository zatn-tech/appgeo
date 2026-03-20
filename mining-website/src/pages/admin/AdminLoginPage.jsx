import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

import { apiClient } from '../../lib/apiClient'
import { useAdminToast } from '../../components/admin/ToastProvider.jsx'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [mode, setMode] = useState('login') // 'login' | 'first-time' | 'forgot'
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [flowLoading, setFlowLoading] = useState(false)
  const [error, setError] = useState('')
  const { pushToast } = useAdminToast()

  useEffect(() => {
    let cancelled = false
    apiClient
      .getAdminMe()
      .then((data) => {
        if (cancelled) return
        if (data?.user) navigate('/admin/dashboard', { replace: true })
      })
      .catch(() => {
        // Not logged in
      })
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await apiClient.loginAdmin({ email, password })
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Reset OTP flow UI when switching modes.
    setOtp('')
    setNewPassword('')
    setShowLoginPassword(false)
    setShowNewPassword(false)
    setOtpSent(false)
    setFlowLoading(false)
    setError('')
  }, [mode])

  async function onRequestFirstTimeOtp(e) {
    e.preventDefault()
    setFlowLoading(true)
    setError('')
    try {
      await apiClient.requestUserVerificationOtp({ email })
      setOtpSent(true)
    } catch (err) {
      setError(err?.message || 'Failed to send OTP')
    } finally {
      setFlowLoading(false)
    }
  }

  async function onConfirmFirstTimeOtp(e) {
    e.preventDefault()
    setFlowLoading(true)
    setError('')
    try {
      await apiClient.confirmUserVerificationOtp({ email, otp, newPassword })
      pushToast({ type: 'success', message: 'Password set successfully. Signing in…' })
      await apiClient.loginAdmin({ email, password: newPassword })
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err?.message || 'Failed to complete setup')
    } finally {
      setFlowLoading(false)
    }
  }

  async function onRequestForgotOtp(e) {
    e.preventDefault()
    setFlowLoading(true)
    setError('')
    try {
      await apiClient.requestPasswordReset({ email })
      setOtpSent(true)
    } catch (err) {
      setError(err?.message || 'Failed to send reset OTP')
    } finally {
      setFlowLoading(false)
    }
  }

  async function onConfirmForgotOtp(e) {
    e.preventDefault()
    setFlowLoading(true)
    setError('')
    try {
      await apiClient.confirmPasswordReset({ email, otp, newPassword })
      pushToast({ type: 'success', message: 'Password reset successfully. Signing in…' })
      await apiClient.loginAdmin({ email, password: newPassword })
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err?.message || 'Failed to reset password')
    } finally {
      setFlowLoading(false)
    }
  }

  useEffect(() => {
    if (!error) return
    pushToast({ type: 'error', message: error })
    setError('')
  }, [error, pushToast])

  return (
    <div className="mx-auto w-full max-w-md py-16">
      <h1 className="section-title">Admin Login</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Access the dashboard with your email and password. Use OTP setup/reset if you are new or locked out.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className={[
            'rounded-2xl px-3 py-1 text-sm font-semibold transition ring-1',
            mode === 'login'
              ? 'bg-white/80 text-slate-900 ring-slate-900/10 dark:bg-slate-900/40 dark:text-slate-100 dark:ring-slate-400/20'
              : 'bg-transparent text-slate-700 ring-slate-900/10 hover:bg-slate-900/5 dark:text-slate-300 dark:ring-slate-400/20 dark:hover:bg-slate-400/10',
          ].join(' ')}
          onClick={() => setMode('login')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={[
            'rounded-2xl px-3 py-1 text-sm font-semibold transition ring-1',
            mode === 'first-time'
              ? 'bg-white/80 text-slate-900 ring-slate-900/10 dark:bg-slate-900/40 dark:text-slate-100 dark:ring-slate-400/20'
              : 'bg-transparent text-slate-700 ring-slate-900/10 hover:bg-slate-900/5 dark:text-slate-300 dark:ring-slate-400/20 dark:hover:bg-slate-400/10',
          ].join(' ')}
          onClick={() => setMode('first-time')}
        >
          First time / Set password
        </button>
        <button
          type="button"
          className={[
            'rounded-2xl px-3 py-1 text-sm font-semibold transition ring-1',
            mode === 'forgot'
              ? 'bg-white/80 text-slate-900 ring-slate-900/10 dark:bg-slate-900/40 dark:text-slate-100 dark:ring-slate-400/20'
              : 'bg-transparent text-slate-700 ring-slate-900/10 hover:bg-slate-900/5 dark:text-slate-300 dark:ring-slate-400/20 dark:hover:bg-slate-400/10',
          ].join(' ')}
          onClick={() => setMode('forgot')}
        >
          Forgot password
        </button>
      </div>

      {mode === 'login' ? (
        <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="input-field"
              autoComplete="username"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showLoginPassword ? 'text' : 'password'}
                required
                className="input-field pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10"
                onClick={() => setShowLoginPassword((v) => !v)}
                aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
              >
                {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      ) : mode === 'first-time' ? (
        <form className="mt-8 grid gap-4" onSubmit={otpSent ? onConfirmFirstTimeOtp : onRequestFirstTimeOtp}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="input-field"
              autoComplete="username"
            />
          </label>

          {otpSent ? (
            <>
              <div className="rounded-xl border border-slate-900/10 bg-white/40 px-3 py-2 text-sm text-slate-600 dark:border-slate-400/10 dark:bg-slate-800/40">
                Check your inbox (and spam), then enter the OTP.
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">OTP</span>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  type="text"
                  required
                  className="input-field font-mono text-xs"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">New password</span>
                <div className="relative">
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    className="input-field pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            </>
          ) : (
            <div className="rounded-xl border border-slate-900/10 bg-white/40 px-3 py-2 text-sm text-slate-600 dark:border-slate-400/10 dark:bg-slate-800/40">
              If your email exists, we will email you an OTP to verify your admin email, then use it to set your password.
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={flowLoading || !email}>
            {flowLoading ? 'Please wait…' : otpSent ? 'Set password' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form className="mt-8 grid gap-4" onSubmit={otpSent ? onConfirmForgotOtp : onRequestForgotOtp}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="input-field"
              autoComplete="username"
            />
          </label>

          {otpSent ? (
            <>
              <div className="rounded-xl border border-slate-900/10 bg-white/40 px-3 py-2 text-sm text-slate-600 dark:border-slate-400/10 dark:bg-slate-800/40">
                Check your inbox (and spam), then enter the OTP.
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">OTP</span>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  type="text"
                  required
                  className="input-field font-mono text-xs"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">New password</span>
                <div className="relative">
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    className="input-field pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            </>
          ) : (
            <div className="rounded-xl border border-slate-900/10 bg-white/40 px-3 py-2 text-sm text-slate-600 dark:border-slate-400/10 dark:bg-slate-800/40">
              If your email exists, we will email you a reset OTP. Enter it along with your new password to regain access.
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={flowLoading || !email}>
            {flowLoading ? 'Please wait…' : otpSent ? 'Reset password' : 'Send reset OTP'}
          </button>
        </form>
      )}
    </div>
  )
}

