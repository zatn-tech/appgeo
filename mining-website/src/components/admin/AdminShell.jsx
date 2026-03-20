import { useEffect, useState } from 'react'

import { AdminFooter } from './AdminFooter.jsx'
import { AdminMobileBar, AdminSidebar } from './AdminSidebar.jsx'

export function AdminShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined' || !mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:pl-72">
        <AdminMobileBar onOpenMenu={() => setMobileOpen(true)} />
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8">{children}</div>
          <AdminFooter />
        </div>
      </div>
    </div>
  )
}
