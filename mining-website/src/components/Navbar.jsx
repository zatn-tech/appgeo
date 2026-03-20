import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { Logo } from './Logo.jsx'
import { nav as navFallback, site as siteFallback } from '../content/siteData.js'
import { useSettings } from '../hooks/usePublicContent.js'

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'group relative px-3 py-2 text-sm font-semibold transition',
          'nav-item',
          isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100',
        ].join(' ')
      }
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-x-2 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-[color:var(--brand-700)] transition group-hover:scale-x-100" />
    </NavLink>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { data: settings } = useSettings({ site: siteFallback, nav: navFallback })
  const links = useMemo(() => settings?.nav || navFallback, [settings?.nav])
  const { theme, toggleTheme } = useTheme()
  const navRef = useRef(null)
  const site = settings?.site || siteFallback

  useEffect(() => {
    if (!open) return

    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }

    function onPointerDown(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <header ref={navRef} className="navbar-glass sticky top-0 z-50">
      <div
        className="h-px w-full shrink-0"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--brand-700) 20%, var(--accent-cyan) 50%, var(--brand-700) 80%, transparent)',
          opacity: 0.35,
        }}
      />
      <div className="border-b border-slate-900/5 dark:border-slate-400/10">
        <div className="container-page flex h-10 items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="hidden items-center gap-3 sm:flex">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{site.tagline2}</span>
            <span className="text-slate-300 dark:text-slate-500">•</span>
            <a className="hover:text-slate-900 dark:hover:text-slate-100" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
          <a
            className="font-semibold text-slate-900 dark:text-slate-100 hover:opacity-80"
            href={`tel:${site.phone.replace(/\\s+/g, '')}`}
          >
            {site.phone}
          </a>
        </div>
      </div>

      <div className="container-page flex h-16 items-center justify-between">
        <NavLink
          to="/"
          className="flex items-center rounded-2xl px-2 py-2 hover:bg-slate-900/5 dark:hover:bg-slate-400/10"
        >
          <Logo size={56} />
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavItem key={l.to} to={l.to}>
              {l.label}
            </NavItem>
          ))}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="btn-ghost ml-1 hidden md:inline-flex"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <NavLink to="/contact" className="btn-primary ml-3">
            Contact
          </NavLink>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="btn-ghost"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="btn-ghost"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            className="border-t border-slate-900/10 dark:border-slate-400/10 md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <div className="container-page py-3">
              <motion.div
                className="grid gap-1"
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -6, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {links.map((l) => (
                  <NavItem key={l.to} to={l.to} onClick={() => setOpen(false)}>
                    {l.label}
                  </NavItem>
                ))}
                <NavLink
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="btn-primary mt-2"
                >
                  Contact
                </NavLink>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

