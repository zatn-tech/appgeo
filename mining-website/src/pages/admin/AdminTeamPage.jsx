import { useEffect, useMemo, useState } from 'react'

import { apiClient } from '../../lib/apiClient'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog.jsx'
import { useAdminToast } from '../../components/admin/ToastProvider.jsx'

const emptyForm = {
  id: null,
  name: '',
  education: '',
  role: '',
  bio: '',
  photo_url: '',
  photoPosition: '',
  sort_order: 0,
  is_published: true,
}

export function AdminTeamPage({ user }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [members, setMembers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [confirmDialog, setConfirmDialog] = useState({ open: false, kind: null, id: null })

  const { pushToast } = useAdminToast()

  const isSuperAdmin = user?.role === 'super_admin'

  const mode = form.id == null ? 'create' : 'edit'
  const sortedMembers = useMemo(() => [...members].sort((a, b) => a.sort_order - b.sort_order), [members])

  async function refresh() {
    const res = await apiClient.getAdminTeam()
    setMembers(res.team || [])
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    apiClient
      .getAdminTeam()
      .then((res) => {
        if (cancelled) return
        setMembers(res.team || [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Failed to load team')
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

  function startCreate() {
    setForm(emptyForm)
    setError('')
  }

  function startEdit(m) {
    setForm({
      id: m.id,
      name: m.name || '',
      education: m.education || '',
      role: m.role || '',
      bio: m.bio || '',
      photo_url: m.photo || '',
      photoPosition: m.photoPosition || '',
      sort_order: m.sort_order ?? 0,
      is_published: Boolean(m.is_published),
    })
    setError('')
  }

  function onChangeField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onUploadPhoto(file) {
    if (!file) return
    setUploadingPhoto(true)
    setError('')
    try {
      const res = await apiClient.uploadAdminTeamPhoto({ file })
      if (!res?.url) throw new Error('Photo upload failed')
      setForm((prev) => ({ ...prev, photo_url: res.url }))
    } catch (err) {
      setError(err?.message || 'Photo upload failed')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        education: form.education,
        role: form.role,
        bio: form.bio,
        photo_url: form.photo_url,
        photoPosition: form.photoPosition,
        sort_order: Number(form.sort_order) || 0,
        is_published: Boolean(form.is_published),
      }

      if (mode === 'create') {
        await apiClient.createAdminTeam(payload)
      } else {
        await apiClient.updateAdminTeam(form.id, payload)
      }

      await refresh()
      startCreate()
    } catch (err) {
      setError(err?.message || 'Failed to save team member')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id) {
    setConfirmDialog({ open: true, kind: 'soft', id })
  }

  async function onHardDelete(id) {
    setConfirmDialog({ open: true, kind: 'hard', id })
  }

  async function confirmDelete() {
    const { kind, id } = confirmDialog
    if (!id || !kind) return

    setConfirmDialog({ open: false, kind: null, id: null })
    setSaving(true)
    setError('')
    try {
      if (kind === 'soft') {
        await apiClient.deleteAdminTeam(id)
      } else {
        await apiClient.deleteAdminTeamHard(id)
      }
      await refresh()
      if (form.id === id) startCreate()
    } catch (err) {
      setError(err?.message || (kind === 'soft' ? 'Delete failed' : 'Hard delete failed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl py-12">
      <h2 className="section-title">
        Team Management
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Create, update, and publish team members. Upload a photo and we’ll store it under <code>/uploads/team</code>.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div>
          {loading ? (
            <div className="text-sm text-slate-600 dark:text-slate-400">Loading…</div>
          ) : null}

          <div className="grid gap-4">
            {sortedMembers.map((m) => (
              <div
                key={m.id}
                className="rounded-3xl border border-slate-900/5 bg-white/60 p-5 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-4">
                      {m.photo ? (
                        <img
                          src={m.photo}
                          alt={m.name}
                          className="h-14 w-14 rounded-2xl object-contain ring-1 ring-white/30"
                          style={m.photoPosition ? { objectPosition: m.photoPosition } : undefined}
                        />
                      ) : (
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[color:var(--brand-700)] to-[color:var(--accent-cyan)] text-white">
                          {m.name
                            .split(' ')
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join('')}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {m.name}
                        </div>
                        {m.education ? (
                          <div className="truncate text-sm text-[color:var(--brand-700)]">{m.education}</div>
                        ) : null}
                        <div className="truncate text-sm text-slate-700 dark:text-slate-300">{m.role}</div>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{m.bio}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="chip">sort: {m.sort_order ?? 0}</span>
                      <span className="chip">{m.is_published ? 'published' : 'unpublished'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className="btn-ghost btn w-fit"
                      onClick={() => startEdit(m)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn w-fit text-rose-700 dark:text-rose-300"
                      onClick={() => onDelete(m.id)}
                    >
                      Unpublish
                    </button>
                    {isSuperAdmin ? (
                      <button
                        type="button"
                        className="btn-ghost btn w-fit text-rose-950 dark:text-rose-200 ring-1 ring-rose-200/80 dark:ring-rose-900/60"
                        onClick={() => onHardDelete(m.id)}
                      >
                        Hard delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-900/5 bg-white/60 p-5 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {mode === 'create' ? 'Add member' : 'Edit member'}
            </div>
            {mode === 'edit' ? (
              <button type="button" className="btn-ghost btn w-fit" onClick={startCreate}>
                New
              </button>
            ) : null}
          </div>

          <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Name</span>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => onChangeField('name', e.target.value)}
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Education</span>
              <input
                className="input-field"
                value={form.education}
                onChange={(e) => onChangeField('education', e.target.value)}
                placeholder="e.g. MSc, MBA, PhD or BE"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Position</span>
              <input
                className="input-field"
                value={form.role}
                onChange={(e) => onChangeField('role', e.target.value)}
                placeholder="e.g. Managing Director"
              />
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Photo upload</span>
              <input
                className="input-field"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingPhoto}
                onChange={(e) => onUploadPhoto(e.target.files?.[0] || null)}
              />
              {form.photo_url ? (
                <div className="flex items-center gap-4">
                  <img
                    src={form.photo_url}
                    alt="Team profile preview"
                    className="h-16 w-16 rounded-xl object-contain ring-1 ring-slate-900/10"
                    style={form.photoPosition ? { objectPosition: form.photoPosition } : undefined}
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs text-slate-600 dark:text-slate-400">{form.photo_url}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{uploadingPhoto ? 'Uploading…' : 'Saved locally after upload'}</div>
                  </div>
                </div>
              ) : null}
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Photo position</span>
              <input
                className="input-field"
                value={form.photoPosition}
                onChange={(e) => onChangeField('photoPosition', e.target.value)}
                placeholder="e.g. 50% 16%"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Bio</span>
              <textarea
                className="input-field resize-none min-h-[120px]"
                value={form.bio}
                onChange={(e) => onChangeField('bio', e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Sort order</span>
                <input
                  className="input-field"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => onChangeField('sort_order', e.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={Boolean(form.is_published)}
                  onChange={(e) => onChangeField('is_published', e.target.checked)}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Published</span>
              </label>
            </div>

            <button className="btn-primary btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : mode === 'create' ? 'Add member' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.kind === 'hard' ? 'Hard delete this team member?' : 'Unpublish this team member?'}
        message={
          confirmDialog.kind === 'hard'
            ? 'Hard delete cannot be undone.'
            : 'Soft delete: the member will be hidden from the website.'
        }
        confirmLabel={confirmDialog.kind === 'hard' ? 'Hard delete' : 'Unpublish'}
        cancelLabel="Cancel"
        danger={confirmDialog.kind === 'hard'}
        confirmDisabled={saving}
        onCancel={() => setConfirmDialog({ open: false, kind: null, id: null })}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

