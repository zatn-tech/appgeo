import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { CTA } from '../components/CTA.jsx'
import { GeoVisual } from '../components/GeoVisual.jsx'
import { Reveal } from '../components/Motion.jsx'
import { about as aboutFallback, quickStats as quickStatsFallback, services as servicesFallback, site as siteFallback, solutions as solutionsFallback } from '../content/siteData.js'
import { useSettings } from '../hooks/usePublicContent.js'
import { apiClient } from '../lib/apiClient.js'

const fallbackHeroSlides = [
  '/images/gallery/1yr-anniversary/1yr-anniversary-012.jpg',
  '/images/gallery/dgps-gps/dgps-gps-009.jpg',
  '/images/gallery/pongal-cel/pongal-cel-004.jpg',
  '/images/gallery/internal-training-knowledge-gaining-session/internal-training-knowledge-gaining-session-003.jpg',
  '/images/gallery/nabet/nabet-002.jpg',
  '/images/gallery/science-city/science-city-004.jpg',
]

export function HomePage() {
  const { data: settingsRes } = useSettings({
    site: siteFallback,
    about: aboutFallback,
    quickStats: quickStatsFallback,
    solutions: solutionsFallback,
    services: servicesFallback,
    projects: [],
  })

  const site = settingsRes?.site || siteFallback
  const about = settingsRes?.about || aboutFallback
  const quickStats = settingsRes?.quickStats || quickStatsFallback
  const services = settingsRes?.services || servicesFallback
  const solutions = settingsRes?.solutions || solutionsFallback

  const { scrollY } = useScroll()
  const gridY = useTransform(scrollY, [0, 900], [0, 60])
  const [slideIdx, setSlideIdx] = useState(0)
  const [heroSlides, setHeroSlides] = useState([])
  const [heroSlidesStatus, setHeroSlidesStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    let cancelled = false
    apiClient
      .getHomeSlides()
      .then((res) => {
        if (cancelled) return
        const slides = (res?.slides || []).map((s) => s.src).filter(Boolean)
        setHeroSlides(slides)
        setSlideIdx(0)
        setHeroSlidesStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        // If the API fails, fall back to bundled slides (but not while still loading).
        setHeroSlides(fallbackHeroSlides)
        setSlideIdx(0)
        setHeroSlidesStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const slides = useMemo(() => {
    if (heroSlidesStatus === 'loading') return []
    return heroSlides.length ? heroSlides : fallbackHeroSlides
  }, [heroSlides, heroSlidesStatus])

  useEffect(() => {
    if (!slides.length) return
    const count = slides.length
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % count)
    }, 3200)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <>
      {/* ── HERO: full-width typographic + abstract visual ── */}
      <section className="relative min-h-[92svh] overflow-hidden">
        <motion.div style={{ y: gridY }} className="absolute inset-0 -z-10 hero-grid hero-spotlight" />

        <div className="container-page relative grid min-h-[92svh] items-center md:grid-cols-[1fr_1fr] md:gap-12">
          {/* GeoVisual as ambient background on mobile */}
          <div className="pointer-events-none absolute inset-0 z-0 opacity-25 md:hidden">
            <GeoVisual className="h-full w-full" mobileBackground />
          </div>

          <div className="relative z-10 pt-10 pb-6 md:pt-0 md:pb-0">
            <Reveal>
              <p className="kicker">{site.tagline2}</p>
              <div className="mt-5">
                <img
                  src="/brand/logo-hero.png"
                  alt="APPGEO – Elevating Environment, Guiding Progress"
                  width={661}
                  height={276}
                  className="w-[16rem] md:w-[22rem] lg:w-[26rem] h-auto dark:brightness-[1.15] dark:contrast-[1.05]"
                />
              </div>
              <div className="mt-4 inline-flex rounded-2xl border border-emerald-300/60 bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 py-3 shadow-[0_8px_30px_-16px_rgba(16,185,129,0.65)] dark:border-emerald-500/40 dark:from-emerald-900/25 dark:to-cyan-900/25">
                <p className="text-sm font-extrabold tracking-wide text-emerald-800 dark:text-emerald-300 md:text-base">
                  One Point Solution
                  <br />
                  For all Mining Clearance
                </p>
              </div>
              <p className="subhead mt-5 max-w-lg">
                {about.summary}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="btn-primary" to="/contact">
                  Start a project <ArrowRight size={16} />
                </Link>
                <Link className="btn-ghost" to="/services">
                  Explore services
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-display font-semibold tracking-wider uppercase text-xs">{site.domain}</span>
                <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                <span>Serving all over India</span>
              </div>
            </Reveal>
          </div>

          <div className="relative hidden md:block">
            <div className="relative h-[36rem] w-full overflow-hidden rounded-3xl border border-slate-900/5 dark:border-slate-400/10 bg-white/50 dark:bg-slate-800/40">
              {slides.length ? (
                slides.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`AppGeo hero slide ${i + 1}`}
                    className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${i === slideIdx ? 'opacity-100' : 'opacity-0'}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                ))
              ) : (
                <div className="absolute inset-0 animate-pulse rounded-3xl bg-slate-100/30 dark:bg-slate-800/45" />
              )}
              <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Show slide ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all ${i === slideIdx ? 'w-8 bg-white' : 'w-2.5 bg-white/60'}`}
                    onClick={() => setSlideIdx(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <a href="#glance" className="scroll-hint">
            Scroll <ChevronDown size={16} />
          </a>
        </div>
      </section>

      {/* ── AT A GLANCE: horizontal stat strip ── */}
      <section id="glance" className="border-y border-slate-900/5 dark:border-slate-400/10 bg-white/40 dark:bg-slate-800/30 backdrop-blur">
        <div className="container-page overflow-x-auto">
          <div className="flex min-w-max items-stretch divide-x divide-slate-900/5 dark:divide-slate-400/10">
            {quickStats.map((s) => (
              <div key={s.label} className="flex-1 px-6 py-5 md:px-8 md:py-6">
                <div className="text-[0.65rem] font-display font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {s.label}
                </div>
                <div className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100 md:text-lg">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FIELD WORK: real photos from the ground ── */}
      <section className="container-page py-16 md:py-24">
        <Reveal>
          <div className="kicker">In the field</div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
            Real work, real precision
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:grid-rows-2 md:gap-4">
          <Reveal className="col-span-2 md:col-span-1 md:row-span-2">
            <div className="overflow-hidden rounded-2xl aspect-[16/9] md:aspect-auto md:h-full">
              <img src="/images/gallery/dgps-gps/dgps-gps-006.jpg" alt="DGPS field setup and survey operations" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="overflow-hidden rounded-2xl aspect-[4/3]">
              <img src="/images/gallery/dgps-gps/dgps-gps-007.jpg" alt="GPS and mapping workflow in field conditions" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="overflow-hidden rounded-2xl aspect-[4/3]">
              <img src="/images/gallery/internal-training-knowledge-gaining-session/internal-training-knowledge-gaining-session-002.jpg" alt="Internal training and technical knowledge session" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="overflow-hidden rounded-2xl aspect-[4/3]">
              <img src="/images/gallery/nabet/nabet-003.jpg" alt="Professional site and compliance activity" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="overflow-hidden rounded-2xl aspect-[4/3]">
              <img src="/images/gallery/science-city/science-city-003.jpg" alt="Team visit and project event moment" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SERVICES: numbered editorial list ── */}
      <section className="container-wide py-16 md:py-24">
        <div className="max-w-4xl">
          <Reveal>
            <div className="kicker">What we do</div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
              Built for compliance · Excellence in Mine Planning · Geospatial accuracy · Consistent on-time delivery.
            </h2>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-0 border-t border-slate-900/10 dark:border-slate-400/10">
          {services.map((s, idx) => (
            <Reveal key={s.title} delay={idx * 0.04}>
              <div className="group grid gap-2 border-b border-slate-900/10 dark:border-slate-400/10 py-6 md:grid-cols-[4rem_1fr_1fr] md:items-start md:gap-8 md:py-8">
                <span className="font-display text-2xl font-bold text-slate-300 dark:text-slate-600 md:text-3xl">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 md:text-xl">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-700)] hover:underline" to="/services">
            All services <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── SOLUTIONS: asymmetric cards ── */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-emerald-50/50 to-transparent dark:via-emerald-900/10" />
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <Reveal>
              <div>
                <div className="kicker">Solutions</div>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
                  End-to-end documentation
                </h2>
              </div>
            </Reveal>
            <Link
              to="/solutions"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 md:inline-flex md:items-center md:gap-1"
            >
              See all <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {solutions.map((s, idx) => (
              <Reveal key={s.title} delay={idx * 0.06}>
                <div className="group relative h-full rounded-2xl border border-slate-900/5 dark:border-slate-400/10 bg-white/70 dark:bg-slate-800/50 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-[0_0_60px_-10px_var(--glow-emerald)]">
                  <span className="mb-3 inline-block font-display text-3xl font-bold text-slate-200 dark:text-slate-700">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.desc}</p>
                  <ul className="mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--brand-700)]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── STRENGTHS: bold typographic list ── */}
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_1fr] md:items-start">
          <Reveal>
            <div className="sticky top-28">
              <div className="kicker">Why AppGeo</div>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
                What we stand for
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">
                {about.managementNote}
              </p>
            </div>
          </Reveal>
          <div className="grid gap-0">
            {about.strengths.map((t, i) => (
              <Reveal key={t} delay={i * 0.06}>
                <div className="flex items-start gap-5 border-b border-slate-900/10 dark:border-slate-400/10 py-5 md:py-6">
                  <span className="font-display text-2xl font-bold text-slate-200 dark:text-slate-700 md:text-3xl">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-base font-medium text-slate-800 dark:text-slate-200 md:text-lg">{t}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
