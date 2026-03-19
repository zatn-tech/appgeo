import { useState } from 'react'
import { ClipboardCheck, Compass, Droplets, Layers, MapPinned, Shield } from 'lucide-react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CTA } from '../components/CTA.jsx'
import { Reveal } from '../components/Motion.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { services } from '../content/siteData.js'

const serviceIcons = [Compass, Droplets, MapPinned, Shield, Layers, ClipboardCheck]
const serviceDetails = {
  'Preparation of Mining Plans': ['Regulator-ready format and annexures', 'Minor mineral scope mapping', 'Submission support workflow'],
  'Geological & Geo-spatial Studies': ['Survey and interpretation support', 'GIS plotting and map outputs', 'Site-specific documentation integration'],
  'Quarry Planning & Reserve Estimation': ['Bench and phase planning support', 'Reserve calculation documentation', 'Compliance-oriented production planning'],
  'Technical Due Diligence & Compliance Advisory': ['Document gap review', 'Statutory readiness checks', 'Timeline-oriented advisory support'],
  'GIS, KML & Satellite Image Analysis': ['KML generation', 'Satellite base map interpretation', 'Drawing-ready geospatial exports'],
}

export function ServicesPage() {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Core services"
        subtitle="Mining plans, geological & geospatial studies, quarry planning and production scheduling, and compliance advisory."
        width="wide"
      />

      {/* Field photo strip */}
      <section className="container-wide pb-10 md:pb-14">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          <Reveal className="col-span-2 md:col-span-1">
            <div className="overflow-hidden rounded-2xl aspect-[16/9] md:aspect-[4/3]">
              <img src="/images/dgps-team-setup.png" alt="Team setting up DGPS base station" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="overflow-hidden rounded-2xl aspect-[4/3]">
              <img src="/images/surveyor-field.png" alt="Surveyor collecting data points" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="overflow-hidden rounded-2xl aspect-[4/3]">
              <img src="/images/dgps-field-vehicle.png" alt="Field vehicle with DGPS equipment" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-wide pb-16 md:pb-24">
        <div className="grid gap-0 border-t border-slate-900/10 dark:border-slate-400/10">
          {services.map((s, idx) => {
            const Icon = serviceIcons[idx % serviceIcons.length]
            const isOpen = idx === openIdx
            const details = serviceDetails[s.title] || ['Field-backed consulting support', 'Documentation and drawing integration', 'Quality and compliance focus']
            return (
              <Reveal key={s.title} delay={idx * 0.04}>
                <div className="group border-b border-slate-900/10 dark:border-slate-400/10 py-7 md:py-9">
                  <div className="grid gap-3 md:grid-cols-[3.5rem_1fr_1.2fr_auto] md:items-start md:gap-8">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[color:var(--brand-700)] to-[color:var(--accent-cyan)] text-white shadow-[0_0_24px_-4px_var(--glow-emerald)]">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 md:text-xl">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">
                    {s.desc}
                  </p>
                    <button
                      type="button"
                      className="btn-ghost inline-flex w-fit items-center gap-2"
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
                  </div>
                  {isOpen ? (
                    <ul className="mt-4 grid gap-2 pl-0 text-sm text-slate-600 dark:text-slate-400 md:pl-[5.5rem]">
                      {details.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand-700)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      <CTA />
    </>
  )
}
