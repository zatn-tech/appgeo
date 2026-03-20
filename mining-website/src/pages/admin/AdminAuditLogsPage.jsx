import { useEffect, useState } from 'react'

import { apiClient } from '../../lib/apiClient'
import { useAdminToast } from '../../components/admin/ToastProvider.jsx'

function formatAuditTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString()
}

function formatAction(action) {
  const map = {
    'login.success': 'Admin login successful',
    'login.failure': 'Admin login failed',
    'login.forbidden': 'Admin login forbidden',

    'users.create': 'Created user',
    'users.update': 'Updated user',
    'users.disable': 'Disabled user',
    'users.verify.request': 'Requested email verification',
    'users.verify.confirm': 'Verified user email',
    'users.password_reset.request': 'Requested password reset',
    'users.password_reset.confirm': 'Password reset confirmed',

    'settings.update': 'Updated site settings',
    'team.create': 'Created team member',
    'team.update': 'Updated team member',
    'team.delete': 'Disabled team member',

    'gallery.section.create': 'Created gallery section',
    'gallery.section.update': 'Updated gallery section',
    'gallery.section.delete': 'Disabled gallery section',

    'gallery.image.create': 'Created gallery image',
    'gallery.image.update': 'Updated gallery image',
    'gallery.image.delete': 'Disabled gallery image',
  }

  if (!action) return '-'
  if (map[action]) return map[action]

  const normalized = String(action).replace(/\./g, ' ').replace(/_/g, ' ')
  return normalized.replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatResource(resourceType, resourceId) {
  const map = {
    admin_auth: 'Admin session',
    admin_user: 'Admin user',
    user: 'User',
    gallery_image: 'Gallery image',
    gallery_section: 'Gallery section',
    team_member: 'Team member',
    site_settings: 'Site settings',
  }

  const label = map[resourceType] || String(resourceType || 'Resource').replace(/_/g, ' ')
  if (resourceId === null || resourceId === undefined || resourceId === '') return label
  return `${label} #${resourceId}`
}

export function AdminAuditLogsPage({ user }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditError, setAuditError] = useState('')
  const [auditLogs, setAuditLogs] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const { pushToast } = useAdminToast()

  const pageSize = 50

  async function refreshAuditLogs() {
    setAuditError('')
    setLoading(true)
    setAuditLoading(true)
    try {
      const res = await apiClient.getAdminAuditLogs({ limit: pageSize })
      setAuditLogs(res?.logs || [])
      setNextCursor(res?.nextCursor ?? null)
    } catch (err) {
      setAuditError(err?.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
      setAuditLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    apiClient
      .getAdminAuditLogs({ limit: pageSize })
      .then((res) => {
        if (cancelled) return
        setAuditLogs(res?.logs || [])
        setNextCursor(res?.nextCursor ?? null)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Failed to load audit logs')
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
    if (!auditError) return
    pushToast({ type: 'error', message: auditError })
    setAuditError('')
  }, [auditError, pushToast])

  async function loadMore() {
    if (!nextCursor) return
    setAuditError('')
    setAuditLoading(true)
    try {
      const res = await apiClient.getAdminAuditLogs({ limit: pageSize, cursor: nextCursor })
      setAuditLogs((prev) => [...prev, ...(res?.logs || [])])
      setNextCursor(res?.nextCursor ?? null)
    } catch (err) {
      setAuditError(err?.message || 'Failed to load more audit logs')
    } finally {
      setAuditLoading(false)
    }
  }

  const hasMore = nextCursor !== null

  return (
    <div className="mx-auto w-full max-w-6xl py-12">
      <div className="flex flex-col gap-2">
        <h2 className="section-title">Audit Logs</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Signed in as <span className="font-medium">{user?.email}</span>
        </p>
      </div>

      {/* Errors are shown via bottom-right admin toasts. */}

      {loading ? (
        <div className="mt-10 text-sm text-slate-600 dark:text-slate-400">Loading…</div>
      ) : (
        <div className="mt-10 rounded-3xl border border-slate-900/5 bg-white/60 p-5 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/40">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent activity</h3>
            <button
              className="btn-ghost btn w-fit"
              type="button"
              onClick={refreshAuditLogs}
              disabled={auditLoading}
            >
              {auditLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>

          {/* Errors are shown via bottom-right admin toasts. */}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-600 dark:text-slate-400">
                  <th className="py-2 pr-2">Time</th>
                  <th className="py-2 pr-2">Actor</th>
                  <th className="py-2 pr-2">Action</th>
                  <th className="py-2 pr-2">Resource</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((l) => (
                  <tr key={l.id} className="border-t border-slate-900/5 dark:border-slate-400/10">
                    <td className="py-2 pr-2">{formatAuditTime(l.createdAt)}</td>
                    <td className="py-2 pr-2">{l.actorEmail || 'system'}</td>
                    <td className="py-2 pr-2">{formatAction(l.action)}</td>
                    <td className="py-2 pr-2">
                      <span>{formatResource(l.resourceType, l.resourceId)}</span>
                    </td>
                  </tr>
                ))}
                {!auditLogs.length ? (
                  <tr>
                    <td className="py-6 text-sm text-slate-600 dark:text-slate-400" colSpan={4}>
                      No audit logs yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-600 dark:text-slate-400">{auditLogs.length} logs</div>
            {hasMore ? (
              <button
                className="btn-ghost btn w-fit"
                type="button"
                onClick={loadMore}
                disabled={auditLoading}
              >
                {auditLoading ? 'Loading…' : 'Load more'}
              </button>
            ) : (
              <div className="text-xs text-slate-600 dark:text-slate-400">End of logs</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

