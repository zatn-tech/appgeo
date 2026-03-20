import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { Navbar } from './Navbar.jsx'
import { Footer } from './Footer.jsx'
import { BackgroundFX } from './BackgroundFX.jsx'
import { ScrollToTop } from './ScrollToTop.jsx'
import { AdminShell } from './admin/AdminShell.jsx'
import { AdminMinimalHeader } from './admin/AdminMinimalHeader.jsx'
import { AdminFooter } from './admin/AdminFooter.jsx'
import { ToastProvider } from './admin/ToastProvider.jsx'

export function Layout() {
  const location = useLocation()
  const isAdminView = location.pathname.startsWith('/admin/')
  const isAdminMinimal =
    location.pathname === '/admin/login' || location.pathname === '/admin/not-authorized'
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.2 })

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return
    if (isAdminView) {
      const raw = window.localStorage.getItem('admin_font_size_px')
      const n = Number(raw)
      const px = Number.isFinite(n) ? Math.max(14, Math.min(20, Math.round(n))) : 16
      document.documentElement.style.fontSize = `${px}px`
      return
    }
    document.documentElement.style.fontSize = '16px'
  }, [isAdminView])

  return (
    <div className="layout-root relative min-h-dvh app-background">
      <BackgroundFX />
      <div className="pointer-events-none absolute inset-0 -z-10 app-grid" />
      <div className="pointer-events-none absolute inset-0 -z-10 app-vignette" />

      <motion.div
        className="fixed top-0 left-0 right-0 z-[70] h-1 origin-left bg-gradient-to-r from-[color:var(--brand-700)] via-[color:var(--accent-cyan)] to-[color:var(--brand-600)]"
        style={{ scaleX }}
      />

      {isAdminView ? (
        isAdminMinimal ? (
          <AdminMinimalHeader />
        ) : null
      ) : (
        <Navbar />
      )}

      {isAdminView && !isAdminMinimal ? (
        <ToastProvider>
          <AdminShell>
            <ScrollToTop />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={reduce ? {} : { opacity: 1, y: 0 }}
                exit={reduce ? {} : { opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </AdminShell>
        </ToastProvider>
      ) : isAdminView ? (
        <ToastProvider>
          <main className="relative">
            <ScrollToTop />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={reduce ? {} : { opacity: 1, y: 0 }}
                exit={reduce ? {} : { opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </ToastProvider>
      ) : (
        <main className="relative">
          <ScrollToTop />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={reduce ? {} : { opacity: 1, y: 0 }}
              exit={reduce ? {} : { opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      )}

      {isAdminView ? (isAdminMinimal ? <AdminFooter /> : null) : <Footer />}
    </div>
  )
}

