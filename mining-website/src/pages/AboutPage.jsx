import { CheckCircle2 } from 'lucide-react'
import { CTA } from '../components/CTA.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { Reveal } from '../components/Motion.jsx'
import { about as aboutFallback } from '../content/siteData.js'
import { useSettings } from '../hooks/usePublicContent.js'

export function AboutPage() {
  const { data: settings } = useSettings({ about: aboutFallback })
  const about = settings?.about || aboutFallback

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="MINING & ENVIRONMENTAL CONSULTANCY"
        subtitle="AppGeo Private Limited is a professional mining, environment and geo technical consultancy firm."
      />

      <section className="container-page pb-16 md:pb-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-start">
          <Reveal>
            <div>
              <div className="kicker">About AppGeo</div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
                Compliance-first, scientifically robust deliverables
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">
                {about.summary}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">
                {about.managementNote}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div>
              <div className="kicker">Core strengths</div>
              <ul className="mt-5 grid gap-4">
                {about.strengths.map((t) => (
                  <li key={t} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[color:var(--brand-700)]" size={18} />
                    <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Field photos ── */}
      <section className="container-page pb-16 md:pb-20">
        <div className="divider" />
        <Reveal>
          <div className="mt-10">
            <div className="kicker">From the field</div>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
              Fieldwork in action
            </h2>
          </div>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {[
            { src: '/images/dgps-tripod-sivaganga.png', alt: 'DGPS tripod setup at Sivaganga' },
            { src: '/images/garmin-gps.png', alt: 'Garmin eTrex 22x GPS unit' },
            { src: '/images/krypton-tripod.png', alt: 'Krypton DGPS base station' },
          ].map((img, i) => (
            <Reveal key={img.src} delay={i * 0.06}>
              <div className="overflow-hidden rounded-2xl aspect-[4/3]">
                <img src={img.src} alt={img.alt} className="h-full w-full object-cover" loading="lazy" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page pb-16 md:pb-20">
        <div className="divider" />
        <div className="mt-10 grid gap-12 md:grid-cols-1 md:items-start">
          <Reveal>
            <div>
              <div className="kicker">Infrastructure & resources</div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
                Tools and networks that support delivery
              </h2>
              <div className="mt-5 grid gap-0 border-t border-slate-900/10 dark:border-slate-400/10">
                {about.infrastructure.map((t, i) => (
                  <div key={t} className="flex items-start gap-4 border-b border-slate-900/10 dark:border-slate-400/10 py-4">
                    <span className="font-display text-lg font-bold text-slate-300 dark:text-slate-600">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 md:text-base">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTA />
    </>
  )
}
