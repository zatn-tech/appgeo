import { useNavigate } from 'react-router-dom'

export function AdminMinimalHeader() {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-900/10 bg-white/90 backdrop-blur dark:border-slate-400/10 dark:bg-slate-900/90">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <button
          type="button"
          className="rounded-xl px-2 py-1 text-left hover:bg-slate-900/5 dark:hover:bg-slate-400/10"
          onClick={() => navigate('/admin/login')}
          aria-label="Admin sign in"
        >
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">AppGeo Admin</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Sign in</div>
        </button>
        <button type="button" className="btn-ghost text-sm" onClick={() => navigate('/')} aria-label="Back to website">
          Back to site
        </button>
      </div>
    </header>
  )
}
