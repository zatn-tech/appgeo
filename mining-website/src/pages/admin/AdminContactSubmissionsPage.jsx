import { useEffect, useState } from 'react'

import { apiClient } from '../../lib/apiClient'
import { useAdminToast } from '../../components/admin/ToastProvider.jsx'

function formatTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString()
}

export function AdminContactSubmissionsPage({ user }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [submissions, setSubmissions] = useState([])

  const [dialog, setDialog] = useState({ open: false, item: null })
  const { pushToast } = useAdminToast()

  async function refresh() {
    setError('')
    setLoading(true)
    try {
      const res = await apiClient.getAdminContactSubmissions({ limit: 100 })
      setSubmissions(res?.submissions || [])
    } catch (err) {
      setError(err?.message || 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!error) return
    pushToast({ type: 'error', message: error })
    setError('')
  }, [error, pushToast])

  return (
    <div className="mx-auto w-full max-w-6xl py-12">
      <div className="flex flex-col gap-2">
        <h2 className="section-title">Contact submissions</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Signed in as <span className="font-medium">{user?.email}</span>
        </p>
      </div>

      {loading ? (
        <div className="mt-10 text-sm text-slate-600 dark:text-slate-400">Loading…</div>
      ) : (
        <div className="mt-10 rounded-3xl border border-slate-900/5 bg-white/60 p-5 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/40">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Latest enquiries</h3>
            <button className="btn-ghost btn w-fit" type="button" onClick={refresh} disabled={loading}>
              Refresh
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-600 dark:text-slate-400">
                  <th className="py-2 pr-2">Time</th>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Phone</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-t border-slate-900/5 dark:border-slate-400/10">
                    <td className="py-2 pr-2">{formatTime(s.createdAt)}</td>
                    <td className="py-2 pr-2 font-semibold">{s.name}</td>
                    <td className="py-2 pr-2">{s.phone || '-'}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        className="btn-ghost btn w-fit"
                        onClick={() => setDialog({ open: true, item: s })}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {!submissions.length ? (
                  <tr>
                    <td className="py-6 text-sm text-slate-600 dark:text-slate-400" colSpan={4}>
                      No contact submissions yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dialog.open && dialog.item ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-900/10 bg-white/90 p-6 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/70">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Contact form</h3>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Submitted: <span className="font-medium">{formatTime(dialog.item.createdAt)}</span>
            </div>

            <div className="mt-5 grid gap-3 text-sm">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</div>
                <div className="font-semibold">{dialog.item.name}</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone</div>
                <div>{dialog.item.phone || '-'}</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Requirement</div>
                <div className="whitespace-pre-wrap leading-relaxed">{dialog.item.need}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="btn-ghost btn w-fit"
                onClick={() => setDialog({ open: false, item: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

