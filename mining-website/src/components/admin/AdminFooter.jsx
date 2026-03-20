export function AdminFooter() {
  return (
    <footer className="footer-glass mt-10">
      <div className="container-page py-8">
        <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} AppGeo Admin</div>
          <div>RBAC-protected content management</div>
        </div>
      </div>
    </footer>
  )
}

