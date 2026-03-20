import { useEffect, useMemo, useState } from 'react'

import { apiClient } from '../../lib/apiClient'
import { useAdminToast } from '../../components/admin/ToastProvider.jsx'

const emptyForm = {
  id: null,
  title: '',
  employmentType: 'Full-time',
  location: '',
  summary: '',
  requirements: '',
  sortOrder: 0,
  isPublished: true,
}

export function AdminCareerOpeningsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [openings, setOpenings] = useState([])
  const [form, setForm] = useState(emptyForm)
  const { pushToast } = useAdminToast()

  const mode = form.id == null ? 'create' : 'edit'
  const sorted = useMemo(() => [...openings].sort((a, b) => a.sortOrder - b.sortOrder), [openings])

  async function refresh() {
    const res = await apiClient.getAdminCareerOpenings()
    setOpenings(res?.openings || [])
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    apiClient
      .getAdminCareerOpenings()
      .then((res) => {
        if (cancelled) return
        setOpenings(res?.openings || [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Failed to load openings')
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

  function startEdit(o) {
    setForm({
      id: o.id,
      title: o.title || '',
      employmentType: o.employmentType || 'Full-time',
      location: o.location || '',
      summary: o.summary || '',
      requirements: o.requirements || '',
      sortOrder: o.sortOrder ?? 0,
      isPublished: Boolean(o.isPublished),
    })
    setError('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        employmentType: form.employmentType,
        location: form.location || null,
        summary: form.summary || null,
        requirements: form.requirements || null,
        sortOrder: Number(form.sortOrder) || 0,
        isPublished: Boolean(form.isPublished),
      }
      if (mode === 'create') await apiClient.createAdminCareerOpening(payload)
      else await apiClient.updateAdminCareerOpening(form.id, payload)
      await refresh()
      setForm(emptyForm)
    } catch (err) {
      setError(err?.message || 'Failed to save opening')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id) {
    setError('')
    try {
      await apiClient.deleteAdminCareerOpening(id)
      await refresh()
      if (form.id === id) setForm(emptyForm)
    } catch (err) {
      setError(err?.message || 'Failed to remove opening')
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl py-12">
      <h2 className="section-title">Career Openings</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Add and manage job openings shown on the public Careers page.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_440px]">
        <div>
          {loading ? <div className="text-sm text-slate-600 dark:text-slate-400">Loading…</div> : null}
          <div className="grid gap-4">
            {sorted.map((o) => (
              <div key={o.id} className="rounded-3xl border border-slate-900/5 bg-white/60 p-5 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{o.title}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <span className="chip">{o.employmentType}</span>
                      {o.location ? <span className="chip">{o.location}</span> : null}
                      <span className="chip">{o.isPublished ? 'published' : 'unpublished'}</span>
                    </div>
                    {o.summary ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{o.summary}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="button" className="btn-ghost btn w-fit" onClick={() => startEdit(o)}>
                      Edit
                    </button>
                    <button type="button" className="btn-ghost btn w-fit text-rose-700 dark:text-rose-300" onClick={() => onDelete(o.id)}>
                      Hide
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!sorted.length ? (
              <div className="rounded-2xl border border-slate-900/10 bg-white/60 p-4 text-sm text-slate-600 dark:border-slate-400/20 dark:bg-slate-800/40 dark:text-slate-300">
                No openings yet.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-900/5 bg-white/60 p-5 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{mode === 'create' ? 'Add opening' : 'Edit opening'}</div>
            {mode === 'edit' ? (
              <button type="button" className="btn-ghost btn w-fit" onClick={() => setForm(emptyForm)}>
                New
              </button>
            ) : null}
          </div>

          <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
            <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            <input className="input-field" placeholder="Employment type" value={form.employmentType} onChange={(e) => setForm((p) => ({ ...p, employmentType: e.target.value }))} />
            <input className="input-field" placeholder="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
            <textarea className="input-field resize-none" rows={3} placeholder="Short summary" value={form.summary} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} />
            <textarea className="input-field resize-none" rows={4} placeholder="Requirements" value={form.requirements} onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" type="number" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
              <label className="flex items-center gap-2 rounded-xl border border-slate-900/10 bg-white px-4 py-2.5 text-sm dark:border-slate-400/20 dark:bg-slate-800/60">
                <input type="checkbox" checked={Boolean(form.isPublished)} onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))} />
                Published
              </label>
            </div>
            <button className="btn-primary btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : mode === 'create' ? 'Add opening' : 'Save opening'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

