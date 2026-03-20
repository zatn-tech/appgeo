import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CTA } from '../components/CTA.jsx'
import { Reveal } from '../components/Motion.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { solutions as solutionsFallback } from '../content/siteData.js'
import { useSettings } from '../hooks/usePublicContent.js'

export function SolutionsPage() {
  const [openIdx, setOpenIdx] = useState(0)
  const { data } = useSettings({ solutions: solutionsFallback })
  const solutions = data?.solutions || solutionsFallback

  return (
    <>
      <PageHeader
        eyebrow="Solutions"
        title="Solutions"
        subtitle="DGPS, GIS/KML analysis, EC documentation support, and replenishment studies for mining projects."
        width="wide"
      />

      {/* Feature photo */}
      <section className="container-wide pb-10 md:pb-14">
        <Reveal>
          <div className="overflow-hidden rounded-2xl aspect-[21/9]">
            <img
              src="/images/gallery/dgps-gps/dgps-gps-010.jpg"
              alt="DGPS and geospatial field workflow for mining documentation"
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </Reveal>
      </section>

      <section className="container-wide pb-16 md:pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {solutions.map((s, idx) => {
            const isOpen = idx === openIdx
            return (
            <Reveal key={s.title} delay={idx * 0.06}>
              <div className="group relative h-full rounded-2xl border border-slate-900/5 dark:border-slate-400/10 bg-white/60 dark:bg-slate-800/40 p-7 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-[0_0_60px_-10px_var(--glow-emerald)]">
                <span className="font-display text-4xl font-bold text-slate-200 dark:text-slate-700">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.desc}</p>
                <button
                  type="button"
                  className="btn-ghost mt-4 inline-flex items-center gap-2"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                >
                  {isOpen ? (
                    <>
                      Hide details <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      View details <ChevronDown size={16} />
                    </>
                  )}
                </button>
                {isOpen ? (
                  <ul className="mt-4 space-y-2">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <ArrowUpRight size={12} className="mt-1 shrink-0 text-[color:var(--brand-700)]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Reveal>
          )})}
        </div>
      </section>

      <CTA />
    </>
  )
}
