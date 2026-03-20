/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'

const AdminToastContext = createContext(null)

function getToastStyles(type) {
  switch (type) {
    case 'success':
      return {
        container: 'border-emerald-300/60 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200',
        accent: 'text-emerald-800 dark:text-emerald-200',
        dot: 'from-emerald-500/30 to-emerald-400/10',
      }
    case 'error':
      return {
        container: 'border-rose-300/60 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200',
        accent: 'text-rose-800 dark:text-rose-200',
        dot: 'from-rose-500/30 to-rose-400/10',
      }
    default:
      return {
        container: 'border-sky-300/60 bg-sky-50 text-sky-800 dark:border-sky-900/50 dark:bg-slate-950/40 dark:text-sky-200',
        accent: 'text-sky-800 dark:text-sky-200',
        dot: 'from-sky-500/30 to-sky-400/10',
      }
  }
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext)
  if (!ctx) {
    return {
      pushToast: () => {},
    }
  }
  return ctx
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextIdRef = useRef(1)

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback(
    ({ type = 'info', message, autoCloseMs = 4000 } = {}) => {
      if (!message) return

      const id = nextIdRef.current++
      const toast = { id, type, message }

      setToasts((prev) => [...prev, toast])

      if (Number.isFinite(autoCloseMs) && autoCloseMs > 0) {
        window.setTimeout(() => removeToast(id), autoCloseMs)
      }
    },
    [removeToast],
  )

  const value = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <AdminToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[140] w-[min(360px,calc(100vw-2rem))]"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const styles = getToastStyles(t.type)
            return (
              <Motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={`pointer-events-auto mt-3 rounded-xl border px-3 py-2 text-sm backdrop-blur ${styles.container}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full bg-gradient-to-b ${styles.dot}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className={`leading-relaxed ${styles.accent}`}>{t.message}</div>
                  </div>
                  <button
                    type="button"
                    className="ml-2 rounded-lg px-1.5 py-0.5 text-xs text-slate-600/80 hover:bg-black/5 dark:text-slate-300/80"
                    onClick={() => removeToast(t.id)}
                    aria-label="Close notification"
                  >
                    Close
                  </button>
                </div>
              </Motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </AdminToastContext.Provider>
  )
}

