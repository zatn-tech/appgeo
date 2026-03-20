import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  ClipboardList,
  FileText,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Settings,
  Shield,
  Sun,
  Users,
  X,
} from 'lucide-react'

import { useTheme } from '../../context/ThemeContext.jsx'
import { apiClient } from '../../lib/apiClient'
import { ADMIN_PERMISSIONS } from '../../auth/adminPermissions'

const ADMIN_FONT_SIZE_KEY = 'admin_font_size_px'
const ADMIN_FONT_MIN = 14
const ADMIN_FONT_MAX = 20
const ADMIN_FONT_DEFAULT = 16

function clampFontSize(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return ADMIN_FONT_DEFAULT
  return Math.max(ADMIN_FONT_MIN, Math.min(ADMIN_FONT_MAX, Math.round(x)))
}

const navIcon = {
  '/admin/dashboard': LayoutDashboard,
  '/admin/settings': Settings,
  '/admin/team': Users,
  '/admin/gallery': ImageIcon,
  '/admin/users': Shield,
  '/admin/audit-logs': FileText,
  '/admin/contact-submissions': Mail,
  '/admin/career-openings': Briefcase,
  '/admin/career-applications': ClipboardList,
}

export function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fontSizePx, setFontSizePx] = useState(() => {
    if (typeof window === 'undefined') return ADMIN_FONT_DEFAULT
    return clampFontSize(window.localStorage.getItem(ADMIN_FONT_SIZE_KEY) || ADMIN_FONT_DEFAULT)
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    apiClient
      .getAdminMe()
      .then((res) => {
        if (cancelled) return
        setAdmin(res?.user || null)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setAdmin(null)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return
    document.documentElement.style.fontSize = `${fontSizePx}px`
    window.localStorage.setItem(ADMIN_FONT_SIZE_KEY, String(fontSizePx))
  }, [fontSizePx])

  const permissions = admin?.permissions || []

  const navItems = useMemo(() => {
    const items = [
      { to: '/admin/dashboard', label: 'Dashboard', permissionKey: null },
      { to: '/admin/settings', label: 'Settings', permissionKey: ADMIN_PERMISSIONS.SITE_SETTINGS_WRITE },
      { to: '/admin/team', label: 'Team', permissionKey: ADMIN_PERMISSIONS.TEAM_WRITE },
      { to: '/admin/gallery', label: 'Gallery', permissionKey: ADMIN_PERMISSIONS.GALLERY_WRITE },
      { to: '/admin/users', label: 'Users', permissionKey: ADMIN_PERMISSIONS.USERS_READ },
      { to: '/admin/audit-logs', label: 'Audit Logs', permissionKey: ADMIN_PERMISSIONS.USERS_READ },
      { to: '/admin/contact-submissions', label: 'Contact', permissionKey: ADMIN_PERMISSIONS.TEAM_READ },
      { to: '/admin/career-openings', label: 'Openings', permissionKey: ADMIN_PERMISSIONS.TEAM_WRITE },
      { to: '/admin/career-applications', label: 'Careers', permissionKey: ADMIN_PERMISSIONS.TEAM_READ },
    ]
    return items
      .filter((i) => !i.permissionKey || permissions.includes(i.permissionKey))
      .filter(() => admin)
  }, [admin, permissions])

  async function onLogout() {
    try {
      await apiClient.logoutAdmin()
    } finally {
      navigate('/admin/login', { replace: true })
    }
  }

  const sidebarInner = (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-900/10 px-4 dark:border-slate-400/10">
        <button
          type="button"
          className="min-w-0 flex-1 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-900/5 dark:hover:bg-slate-400/10"
          onClick={() => {
            navigate('/admin/dashboard')
            onCloseMobile?.()
          }}
          aria-label="Go to admin dashboard"
        >
          <div className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">AppGeo Admin</div>
          <div className="truncate text-xs text-slate-600 dark:text-slate-400">{admin?.role || 'Dashboard'}</div>
        </button>
        <button
          type="button"
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-900/5 dark:text-slate-400 dark:hover:bg-slate-400/10 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {admin ? (
        <div className="border-b border-slate-900/10 px-4 py-3 dark:border-slate-400/10">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Signed in</div>
          <div className="mt-1 truncate text-sm text-slate-800 dark:text-slate-200">{admin.email}</div>
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {loading ? (
          <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">Loading…</div>
        ) : (
          <ul className="space-y-0.5">
            {navItems.map((i) => {
              const Icon = navIcon[i.to] || LayoutDashboard
              return (
                <li key={i.to}>
                  <NavLink
                    to={i.to}
                    end={i.to === '/admin/dashboard'}
                    onClick={() => onCloseMobile?.()}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                        isActive
                          ? 'bg-[color:var(--brand-700)]/15 text-slate-900 ring-1 ring-[color:var(--brand-700)]/25 dark:bg-emerald-900/25 dark:text-slate-100 dark:ring-emerald-500/20'
                          : 'text-slate-700 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-slate-400/10',
                      ].join(' ')
                    }
                  >
                    <Icon size={18} className="shrink-0 opacity-80" aria-hidden />
                    {i.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        )}
      </nav>

      <div className="shrink-0 border-t border-slate-900/10 p-3 dark:border-slate-400/10">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-slate-400/10"
            onClick={() => setFontSizePx((prev) => clampFontSize(prev - 1))}
            aria-label="Decrease font size"
          >
            A−
          </button>
          <button
            type="button"
            className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-slate-400/10"
            onClick={() => setFontSizePx(ADMIN_FONT_DEFAULT)}
            title={`${fontSizePx}px`}
            aria-label="Reset font size"
          >
            A
          </button>
          <button
            type="button"
            className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-slate-400/10"
            onClick={() => setFontSizePx((prev) => clampFontSize(prev + 1))}
            aria-label="Increase font size"
          >
            A+
          </button>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-900/10 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-400/15 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-700/80"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={16} className="opacity-80" /> : <Moon size={16} className="opacity-80" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100/80 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-900/50"
            onClick={onLogout}
          >
            <LogOut size={16} />
            Logout
          </button>
          <button
            type="button"
            className="w-full rounded-lg py-1.5 text-center text-xs text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
            onClick={() => {
              navigate('/')
              onCloseMobile?.()
            }}
          >
            ← Back to website
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={[
          'fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        aria-hidden={!mobileOpen}
        onClick={onCloseMobile}
      />

      {/* Sidebar: drawer on mobile, fixed on desktop */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[88vw] flex-col border-r border-slate-900/10 bg-white/95 shadow-xl backdrop-blur-xl transition-transform duration-200 dark:border-slate-400/10 dark:bg-slate-900/95 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {sidebarInner}
      </aside>
    </>
  )
}

export function AdminMobileBar({ onOpenMenu }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-900/10 bg-white/90 px-4 backdrop-blur dark:border-slate-400/10 dark:bg-slate-900/90 lg:hidden">
      <button
        type="button"
        className="rounded-xl p-2 text-slate-800 hover:bg-slate-900/5 dark:text-slate-100 dark:hover:bg-slate-400/10"
        onClick={onOpenMenu}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">AppGeo Admin</span>
    </header>
  )
}
