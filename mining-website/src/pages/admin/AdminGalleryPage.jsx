import { useEffect, useMemo, useState } from 'react'

import { apiClient } from '../../lib/apiClient'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog.jsx'
import { useAdminToast } from '../../components/admin/ToastProvider.jsx'

export function AdminGalleryPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState([])
  const [upload, setUpload] = useState({ alt: '', file: null })
  const [confirmDialog, setConfirmDialog] = useState({ open: false, imageId: null })
  const { pushToast } = useAdminToast()

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [images],
  )

  async function refreshAll() {
    const imagesRes = await apiClient.getAdminGalleryImages()
    setImages(imagesRes.images || [])
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    apiClient
      .getAdminGalleryImages()
      .then((imagesRes) => {
        if (cancelled) return
        setImages(imagesRes.images || [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Failed to load gallery')
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

  async function onUpload(e) {
    e.preventDefault()
    if (!upload.file) {
      setError('Please choose an image file to upload.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await apiClient.uploadGalleryImage({
        alt: upload.alt || undefined,
        file: upload.file,
      })
      setUpload({ alt: '', file: null })
      await refreshAll()
    } catch (err) {
      setError(err?.message || 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  async function onUpdateImage(id, payload) {
    setSaving(true)
    setError('')
    try {
      await apiClient.updateAdminGalleryImage(id, payload)
      await refreshAll()
    } catch (err) {
      setError(err?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  async function onDeleteImage(id) {
    setConfirmDialog({ open: true, imageId: id })
  }

  async function confirmDeleteImage() {
    const id = confirmDialog.imageId
    if (!id) return

    setConfirmDialog({ open: false, imageId: null })
    setSaving(true)
    setError('')
    try {
      await apiClient.deleteAdminGalleryImage(id)
      await refreshAll()
    } catch (err) {
      setError(err?.message || 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  async function moveImage(idx, dir) {
    const from = idx
    const to = idx + dir
    if (to < 0 || to >= sortedImages.length) return
    const a = sortedImages[from]
    const b = sortedImages[to]
    setSaving(true)
    setError('')
    try {
      await Promise.all([
        apiClient.updateAdminGalleryImage(a.id, { sort_order: b.sort_order }),
        apiClient.updateAdminGalleryImage(b.id, { sort_order: a.sort_order }),
      ])
      await refreshAll()
    } catch (err) {
      setError(err?.message || 'Reorder failed')
    } finally {
      setSaving(false)
    }
  }

  const homeSlideCount = useMemo(
    () => images.filter((img) => img.is_home_slide && img.is_published).length,
    [images],
  )

  return (
    <div className="mx-auto w-full max-w-7xl py-12">
      <h2 className="section-title">Gallery Management</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Upload and publish images. Use the controls on each row to manage the public gallery and the homepage hero.
      </p>

      <div className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 text-sm text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/35 dark:text-emerald-100">
        <p className="font-semibold text-emerald-900 dark:text-emerald-50">Homepage hero slider</p>
        <p className="mt-1 text-emerald-900/90 dark:text-emerald-100/90">
          Turn on <strong>Homepage slider</strong> for any image that is also <strong>Published</strong>. Those
          images rotate on the home page (
          {loading ? '…' : `${homeSlideCount} image${homeSlideCount === 1 ? '' : 's'} in the slider now`}).
        </p>
        <p className="mt-2 text-xs text-emerald-800/80 dark:text-emerald-200/80">
          Tip: publish the image first, then enable “Homepage slider” so visitors see it in the slideshow.
        </p>
      </div>

      {/*
        Error toasts are emitted via the bottom-right AdminToast host.
      */}

      {loading ? <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">Loading…</div> : null}

      <div className="mt-10 rounded-3xl border border-slate-900/5 bg-white/60 p-5 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/40">
        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={onUpload}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Alt text (optional)</span>
            <input
              className="input-field"
              value={upload.alt}
              onChange={(e) => setUpload((p) => ({ ...p, alt: e.target.value }))}
              placeholder="Describe this image"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Image file</span>
            <input
              className="input-field"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setUpload((p) => ({ ...p, file: e.target.files?.[0] || null }))}
              required
            />
          </label>

          <button className="btn-primary btn w-fit" type="submit" disabled={saving}>
            Upload image
          </button>
        </form>

        <div className="mt-8 grid gap-3">
          {sortedImages.map((img, idx) => (
            <div
              key={img.id}
              className="rounded-2xl border border-slate-900/10 bg-white/40 p-3 dark:border-slate-400/10 dark:bg-slate-800/30"
            >
              <div className="flex items-start gap-3">
                <img src={img.file_url} alt={img.alt || ''} className="h-20 w-24 rounded-lg object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    #{img.id} · sort {img.sort_order}
                  </div>
                  <div className="mt-1 break-all text-xs text-slate-600 dark:text-slate-400">{img.file_url}</div>
                  <label className="mt-2 grid gap-1">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Alt text</span>
                    <input
                      className="input-field py-1.5 text-xs"
                      defaultValue={img.alt || ''}
                      onBlur={(e) => {
                        const val = e.target.value
                        if (val !== (img.alt || '')) onUpdateImage(img.id, { alt: val })
                      }}
                    />
                  </label>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={Boolean(img.is_published)}
                        onChange={(e) => onUpdateImage(img.id, { is_published: e.target.checked })}
                      />
                      Published
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={Boolean(img.is_home_slide)}
                        onChange={(e) => onUpdateImage(img.id, { is_home_slide: e.target.checked })}
                      />
                      Homepage slider
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    className="btn-ghost btn px-2 py-1 text-xs"
                    disabled={idx === 0 || saving}
                    onClick={() => moveImage(idx, -1)}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn px-2 py-1 text-xs"
                    disabled={idx === sortedImages.length - 1 || saving}
                    onClick={() => moveImage(idx, 1)}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn px-2 py-1 text-xs text-rose-700 dark:text-rose-300"
                    onClick={() => onDeleteImage(img.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!sortedImages.length ? (
            <div className="text-sm text-slate-600 dark:text-slate-400">No gallery images yet.</div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title="Delete this image?"
        message="Soft delete: the image will become unpublished and hidden from the website."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        confirmDisabled={saving}
        onCancel={() => setConfirmDialog({ open: false, imageId: null })}
        onConfirm={confirmDeleteImage}
      />
    </div>
  )
}
