import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { Navbar } from './Navbar.jsx'
import { Footer } from './Footer.jsx'
import { BackgroundFX } from './BackgroundFX.jsx'
import { ScrollToTop } from './ScrollToTop.jsx'

export function Layout() {
  const location = useLocation()
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.2 })

  return (
    <div className="layout-root relative min-h-dvh app-background">
      <BackgroundFX />
      <div className="pointer-events-none absolute inset-0 -z-10 app-grid" />
      <div className="pointer-events-none absolute inset-0 -z-10 app-vignette" />

      <motion.div
        className="fixed top-0 left-0 right-0 z-[70] h-1 origin-left bg-gradient-to-r from-[color:var(--brand-700)] via-[color:var(--accent-cyan)] to-[color:var(--brand-600)]"
        style={{ scaleX }}
      />

      <Navbar />

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

      <Footer />
    </div>
  )
}

