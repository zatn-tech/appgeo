import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { apiClient } from '../../lib/apiClient'

export function RequirePermission({ permissions = [], children }) {
  const [state, setState] = useState({ loading: true, user: null })

  useEffect(() => {
    let cancelled = false
    apiClient
      .getAdminMe()
      .then((data) => {
        if (cancelled) return
        setState({ loading: false, user: data?.user || null })
      })
      .catch(() => {
        if (cancelled) return
        setState({ loading: false, user: null })
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (state.loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-600 dark:text-slate-300">
        Loading...
      </div>
    )
  }

  if (!state.user) {
    return <Navigate to="/admin/login" replace />
  }

  if (permissions.length) {
    const ok = permissions.every((p) => state.user.permissions?.includes(p))
    if (!ok) return <Navigate to="/admin/not-authorized" replace />
  }

  if (typeof children === 'function') {
    return children(state.user)
  }

  return children
}

