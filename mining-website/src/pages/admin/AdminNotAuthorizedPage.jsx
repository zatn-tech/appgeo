import { Link } from 'react-router-dom'

export function AdminNotAuthorizedPage() {
  return (
    <div className="mx-auto w-full max-w-2xl py-16">
      <h1 className="section-title">
        Not authorized
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Your account does not have permission to view this page.
      </p>
      <div className="mt-6">
        <Link
          to="/admin/dashboard"
          className="btn btn-ghost inline-flex items-center gap-2 border border-slate-900/10 dark:border-slate-200/20"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

