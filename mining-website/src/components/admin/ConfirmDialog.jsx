import { useEffect } from 'react'

export function ConfirmDialog({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-3xl border border-slate-900/10 bg-white/90 p-6 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/70"
      >
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {message ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p> : null}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-ghost btn w-fit" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              danger
                ? 'btn w-fit bg-rose-600 text-white hover:bg-rose-700 border-rose-400/40'
                : 'btn btn-primary w-fit'
            }
            disabled={confirmDisabled}
            onClick={onConfirm}
          >
            {confirmDisabled ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

