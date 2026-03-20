import { useEffect, useState } from 'react'

import { apiClient } from '../../lib/apiClient'
import { useAdminToast } from '../../components/admin/ToastProvider.jsx'

function formatTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString()
}

export function AdminCareerApplicationsPage({ user }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { pushToast } = useAdminToast()

  const [openings, setOpenings] = useState([])
  const [selectedOpeningId, setSelectedOpeningId] = useState('')
  const [applications, setApplications] = useState([])
  const [dialog, setDialog] = useState({ open: false, item: null })

  async function refresh() {
    setError('')
    setLoading(true)
    try {
      const [appsRes, openingsRes] = await Promise.all([
        apiClient.getAdminCareerApplications({
          limit: 100,
          openingId: selectedOpeningId ? Number(selectedOpeningId) : undefined,
        }),
        apiClient.getAdminCareerOpenings(),
      ])
      setOpenings(openingsRes?.openings || [])
      setApplications(appsRes?.applications || [])
    } catch (err) {
      setError(err?.message || 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOpeningId])

  useEffect(() => {
    if (!error) return
    pushToast({ type: 'error', message: error })
    setError('')
  }, [error, pushToast])

  return (
    <div className="mx-auto w-full max-w-6xl py-12">
      <div className="flex flex-col gap-2">
        <h2 className="section-title">Career applications</h2>
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
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Latest applications</h3>
            <div className="flex items-center gap-2">
              <select
                className="input-field min-w-[220px]"
                value={selectedOpeningId}
                onChange={(e) => setSelectedOpeningId(e.target.value)}
              >
                <option value="">All openings</option>
                {openings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
              <button className="btn-ghost btn w-fit" type="button" onClick={refresh} disabled={loading}>
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-600 dark:text-slate-400">
                  <th className="py-2 pr-2">Time</th>
                  <th className="py-2 pr-2">Opening</th>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Email</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id} className="border-t border-slate-900/5 dark:border-slate-400/10">
                    <td className="py-2 pr-2">{formatTime(a.createdAt)}</td>
                    <td className="py-2 pr-2">{a.openingTitle || '-'}</td>
                    <td className="py-2 pr-2 font-semibold">{a.fullName}</td>
                    <td className="py-2 pr-2">{a.email}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        className="btn-ghost btn w-fit"
                        onClick={() => setDialog({ open: true, item: a })}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {!applications.length ? (
                  <tr>
                    <td className="py-6 text-sm text-slate-600 dark:text-slate-400" colSpan={5}>
                      No career applications yet.
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
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Application form</h3>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Submitted: <span className="font-medium">{formatTime(dialog.item.createdAt)}</span>
            </div>

            <div className="mt-5 grid gap-4 text-sm">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Opening</div>
                <div>{dialog.item.openingTitle || '-'}</div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Full name</div>
                <div className="font-semibold">{dialog.item.fullName}</div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</div>
                <div>{dialog.item.email}</div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone</div>
                <div>{dialog.item.phone || '-'}</div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Applied role</div>
                <div>{dialog.item.appliedRole || '-'}</div>
              </div>

              {dialog.item.education ? (
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Education</div>
                  <div className="whitespace-pre-wrap leading-relaxed">{dialog.item.education}</div>
                </div>
              ) : null}

              {dialog.item.experience ? (
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Experience</div>
                  <div className="whitespace-pre-wrap leading-relaxed">{dialog.item.experience}</div>
                </div>
              ) : null}

              {dialog.item.location ? (
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</div>
                  <div className="whitespace-pre-wrap leading-relaxed">{dialog.item.location}</div>
                </div>
              ) : null}

              {dialog.item.resumeUrl ? (
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Resume URL</div>
                  <div>
                    <a className="link-underline" href={dialog.item.resumeUrl} target="_blank" rel="noreferrer">
                      {dialog.item.resumeUrl}
                    </a>
                  </div>
                </div>
              ) : null}

              {dialog.item.message ? (
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Message</div>
                  <div className="whitespace-pre-wrap leading-relaxed">{dialog.item.message}</div>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end">
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

