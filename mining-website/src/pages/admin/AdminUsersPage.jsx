import { ADMIN_PERMISSIONS } from '../../auth/adminPermissions'
import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { apiClient } from '../../lib/apiClient'
import { useAdminToast } from '../../components/admin/ToastProvider.jsx'

export function AdminUsersPage({ user }) {
  const canManageUsers = Boolean(user?.permissions?.includes(ADMIN_PERMISSIONS.USERS_WRITE))
  const isSuperAdminActor = user?.role === 'super_admin'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [disableDialog, setDisableDialog] = useState({ open: false, userId: null })
  const [users, setUsers] = useState([])
  const [sideTab, setSideTab] = useState('create') // UI-only: reduce clutter by showing one panel at a time

  const [showCreatePassword, setShowCreatePassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)

  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    role: 'admin',
    requireVerification: true,
  })

  const [createdInfo, setCreatedInfo] = useState('')

  const [otpForm, setOtpForm] = useState({
    email: '',
    otp: '',
  })
  const [otpResult, setOtpResult] = useState('')

  const [resetForm, setResetForm] = useState({
    email: '',
    newPassword: '',
    otp: '',
  })
  const [resetResult, setResetResult] = useState('')

  const roles = useMemo(
    () => (isSuperAdminActor ? ['admin', 'manager'] : ['super_admin', 'admin', 'manager']),
    [isSuperAdminActor],
  )
  const { pushToast } = useAdminToast()

  async function refreshUsers() {
    setError('')
    const res = await apiClient.getAdminUsers()
    setUsers(res?.users || [])
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    apiClient
      .getAdminUsers()
      .then((res) => {
        if (cancelled) return
        setUsers(res?.users || [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Failed to load users')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!error) return
    pushToast({ type: 'error', message: error })
    setError('')
  }, [error, pushToast])

  useEffect(() => {
    if (!notice) return
    pushToast({ type: 'success', message: notice, autoCloseMs: 3500 })
    setNotice('')
  }, [notice, pushToast])

  useEffect(() => {
    if (!createdInfo) return
    pushToast({ type: 'success', message: createdInfo })
    setCreatedInfo('')
  }, [createdInfo, pushToast])

  useEffect(() => {
    if (!otpResult) return
    pushToast({ type: 'success', message: otpResult })
    setOtpResult('')
  }, [otpResult, pushToast])

  useEffect(() => {
    if (!resetResult) return
    pushToast({ type: 'success', message: resetResult })
    setResetResult('')
  }, [resetResult, pushToast])

  function onChangeCreateField(key, value) {
    setCreateForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onCreateUser(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setCreatedInfo('')
    try {
      const payload = {
        email: createForm.email,
        role: createForm.role,
        requireVerification: true,
      }

      if (!isSuperAdminActor) {
        payload.password = createForm.password
        payload.requireVerification = Boolean(createForm.requireVerification)
      }
      const res = await apiClient.createAdminUser(payload)
      setCreatedInfo(
        res?.id ? `Created user #${res.id}` : 'User created',
      )
      await refreshUsers()
    } catch (err) {
      setError(err?.message || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  async function onDisableUser(id) {
    setError('')
    setNotice('')
    setDisableDialog({ open: true, userId: id })
  }

  async function performDisableUser(userId) {
    const id = Number(userId)
    if (!Number.isFinite(id)) return

    setDisableDialog({ open: false, userId: null })
    setError('')
    setNotice('')

    try {
      await apiClient.deleteAdminUser(id)

      // Optimistic update so the table reflects the change immediately.
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: 0 } : u)))

      await refreshUsers()
      setNotice(`User #${id} disabled successfully.`)
      setTimeout(() => setNotice(''), 3500)
    } catch (err) {
      setError(err?.message || 'Disable failed')
    }
  }

  async function onRequestOtp(e) {
    e.preventDefault()
    setOtpResult('')
    setError('')
    try {
      await apiClient.requestUserVerificationOtp({ email: otpForm.email })
      setOtpResult('OTP sent to the email address. Please check your inbox/spam.')
    } catch (err) {
      setError(err?.message || 'OTP request failed')
    }
  }

  async function onConfirmOtp(e) {
    e.preventDefault()
    setOtpResult('')
    setError('')
    try {
      await apiClient.confirmUserVerificationOtp({ email: otpForm.email, otp: otpForm.otp })
      setOtpResult('Email verified. The user should now be able to login.')
      await refreshUsers()
    } catch (err) {
      setError(err?.message || 'OTP confirmation failed')
    }
  }

  async function onRequestReset(e) {
    e.preventDefault()
    setResetResult('')
    setError('')
    try {
      await apiClient.requestPasswordReset({ email: resetForm.email })
      setResetResult('Reset OTP sent to the email address. Please check your inbox/spam.')
    } catch (err) {
      setError(err?.message || 'Password reset request failed')
    }
  }

  async function onConfirmReset(e) {
    e.preventDefault()
    setResetResult('')
    setError('')
    try {
      await apiClient.confirmPasswordReset({
        email: resetForm.email,
        otp: resetForm.otp,
        newPassword: resetForm.newPassword,
      })
      setResetResult('Password reset complete. The user should now be able to login.')
      await refreshUsers()
    } catch (err) {
      setError(err?.message || 'Password reset failed')
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl py-12">
      <div className="flex flex-col gap-2">
        <h2 className="section-title">Users & RBAC</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {canManageUsers
            ? 'Create admin users, verify them with OTP, and reset passwords.'
            : 'Your role can view users, but cannot manage accounts/roles.'}
        </p>
      </div>

      {/* Error/success messages are shown via bottom-right admin toasts. */}

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_520px]">
        <div>
          {loading ? <div className="text-sm text-slate-600 dark:text-slate-400">Loading…</div> : null}
          {!loading ? (
            <div className="rounded-3xl border border-slate-900/5 bg-white/60 p-5 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/40">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Admin Users</h3>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{users.length} total</div>
                </div>
                <button className="btn-ghost btn w-fit" type="button" onClick={refreshUsers} disabled={loading}>
                  Refresh
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-600 dark:text-slate-400">
                      <th className="py-2 pr-2">ID</th>
                      <th className="py-2 pr-2">Email</th>
                      <th className="py-2 pr-2">Role</th>
                      <th className="py-2 pr-2">Status</th>
                      <th className="py-2">Verified</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-slate-900/5 dark:border-slate-400/10">
                        <td className="py-2 pr-2">{u.id}</td>
                        <td className="py-2 pr-2 font-mono">{u.email}</td>
                        <td className="py-2 pr-2">{u.role_name || u.role || u.role_name}</td>
                        <td className="py-2 pr-2">
                          {u.is_active ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800/40">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800/40">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-2">{u.email_verified_at ? 'Yes' : 'No'}</td>
                        <td className="py-2">
                          {canManageUsers && u.is_active ? (
                            <button
                              type="button"
                              className="btn-ghost btn w-fit text-rose-700 dark:text-rose-300"
                              onClick={() => onDisableUser(u.id)}
                            >
                              Disable
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 dark:text-slate-400">{u.is_active ? ' ' : 'Disabled'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!users.length ? (
                      <tr>
                        <td className="py-6 text-sm text-slate-600 dark:text-slate-400" colSpan={6}>
                          No users found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={[
                'rounded-2xl px-3 py-1 text-sm font-semibold transition ring-1',
                sideTab === 'create'
                  ? 'bg-white/80 text-slate-900 ring-slate-900/10 dark:bg-slate-900/40 dark:text-slate-100 dark:ring-slate-400/20'
                  : 'bg-transparent text-slate-700 ring-slate-900/10 hover:bg-slate-900/5 dark:text-slate-300 dark:ring-slate-400/20 dark:hover:bg-slate-400/10',
              ].join(' ')}
              onClick={() => setSideTab('create')}
            >
              Create User
            </button>
            <button
              type="button"
              className={[
                'rounded-2xl px-3 py-1 text-sm font-semibold transition ring-1',
                sideTab === 'verify'
                  ? 'bg-white/80 text-slate-900 ring-slate-900/10 dark:bg-slate-900/40 dark:text-slate-100 dark:ring-slate-400/20'
                  : 'bg-transparent text-slate-700 ring-slate-900/10 hover:bg-slate-900/5 dark:text-slate-300 dark:ring-slate-400/20 dark:hover:bg-slate-400/10',
              ].join(' ')}
              onClick={() => setSideTab('verify')}
            >
              OTP Verification
            </button>
            <button
              type="button"
              className={[
                'rounded-2xl px-3 py-1 text-sm font-semibold transition ring-1',
                sideTab === 'reset'
                  ? 'bg-white/80 text-slate-900 ring-slate-900/10 dark:bg-slate-900/40 dark:text-slate-100 dark:ring-slate-400/20'
                  : 'bg-transparent text-slate-700 ring-slate-900/10 hover:bg-slate-900/5 dark:text-slate-300 dark:ring-slate-400/20 dark:hover:bg-slate-400/10',
              ].join(' ')}
              onClick={() => setSideTab('reset')}
            >
              Forget Password
            </button>
          </div>

          {sideTab === 'create' ? (
            <div className="mt-6 rounded-3xl border border-slate-900/5 bg-white/60 p-5 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/40">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Create User</h3>

              {canManageUsers ? null : (
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  You don&apos;t have permission to create or manage users.
                </div>
              )}

              {canManageUsers ? (
                <form className="mt-4 grid gap-4" onSubmit={onCreateUser}>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Email</span>
                    <input
                      className="input-field"
                      value={createForm.email}
                      onChange={(e) => onChangeCreateField('email', e.target.value)}
                      type="email"
                      required
                    />
                  </label>

                  {isSuperAdminActor ? (
                    <div className="rounded-xl border border-slate-900/10 bg-white/40 px-3 py-2 text-sm text-slate-600 dark:border-slate-400/10 dark:bg-slate-800/40">
                      The password will be set by the user after OTP verification on the admin login page.
                    </div>
                  ) : (
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Password</span>
                      <div className="relative">
                        <input
                          className="input-field pr-10"
                          value={createForm.password}
                          onChange={(e) => onChangeCreateField('password', e.target.value)}
                          type={showCreatePassword ? 'text' : 'password'}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10"
                          onClick={() => setShowCreatePassword((v) => !v)}
                          aria-label={showCreatePassword ? 'Hide password' : 'Show password'}
                        >
                          {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </label>
                  )}

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Role</span>
                    <select
                      className="input-field"
                      value={createForm.role}
                      onChange={(e) => onChangeCreateField('role', e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </label>

                  {isSuperAdminActor ? null : (
                    <label className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        checked={Boolean(createForm.requireVerification)}
                        onChange={(e) => onChangeCreateField('requireVerification', e.target.checked)}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Require OTP verification</span>
                    </label>
                  )}

                  {/* Created-user info is shown via bottom-right admin toasts. */}

                  <button className="btn-primary btn" type="submit" disabled={saving}>
                    {saving ? 'Creating…' : 'Create user'}
                  </button>
                </form>
              ) : null}
            </div>
          ) : null}

          {sideTab === 'verify' ? (
            <div className="mt-6 rounded-3xl border border-slate-900/5 bg-white/60 p-5 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/40">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">OTP Verification</h3>

              <form className="mt-4 grid gap-4" onSubmit={onRequestOtp}>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Email</span>
                  <input
                    className="input-field"
                    value={otpForm.email}
                    onChange={(e) => setOtpForm((prev) => ({ ...prev, email: e.target.value }))}
                    type="email"
                    required
                  />
                </label>
                <button className="btn-ghost btn w-fit" type="submit" disabled={!canManageUsers}>
                  Request OTP
                </button>
              </form>

              <form className="mt-4 grid gap-4" onSubmit={onConfirmOtp}>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">OTP</span>
                  <input
                    className="input-field"
                    value={otpForm.otp}
                    onChange={(e) => setOtpForm((prev) => ({ ...prev, otp: e.target.value }))}
                    required
                  />
                </label>
                <button className="btn-primary btn w-fit" type="submit" disabled={!canManageUsers}>
                  Confirm email
                </button>
              </form>

              {/* OTP results are shown via bottom-right admin toasts. */}
            </div>
          ) : null}

          {sideTab === 'reset' ? (
            <div className="mt-6 rounded-3xl border border-slate-900/5 bg-white/60 p-5 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/40">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Forget Password</h3>

              <form className="mt-4 grid gap-4" onSubmit={onRequestReset}>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Email</span>
                  <input
                    className="input-field"
                    value={resetForm.email}
                    onChange={(e) => setResetForm((prev) => ({ ...prev, email: e.target.value }))}
                    type="email"
                    required
                  />
                </label>
                <button className="btn-ghost btn w-fit" type="submit" disabled={!canManageUsers}>
                  Request reset OTP
                </button>
              </form>

              <form className="mt-4 grid gap-4" onSubmit={onConfirmReset}>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">OTP</span>
                  <input
                    className="input-field font-mono text-xs"
                    value={resetForm.otp}
                    onChange={(e) => setResetForm((prev) => ({ ...prev, otp: e.target.value }))}
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">New password</span>
                  <div className="relative">
                    <input
                      className="input-field pr-10"
                      value={resetForm.newPassword}
                      onChange={(e) => setResetForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      type={showResetPassword ? 'text' : 'password'}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10"
                      onClick={() => setShowResetPassword((v) => !v)}
                      aria-label={showResetPassword ? 'Hide new password' : 'Show new password'}
                    >
                      {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <button className="btn-primary btn w-fit" type="submit" disabled={!canManageUsers}>
                  Reset password
                </button>
              </form>

              {/* Reset results are shown via bottom-right admin toasts. */}
            </div>
          ) : null}
        </div>
      </div>

      {disableDialog.open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-900/10 bg-white/90 p-6 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/70">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Disable user?</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              This sets the user to inactive and invalidates any pending OTP/password reset codes.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="btn-ghost btn w-fit"
                onClick={() => setDisableDialog({ open: false, userId: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary btn w-fit"
                onClick={() => performDisableUser(disableDialog.userId)}
              >
                Disable user
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  )
}

