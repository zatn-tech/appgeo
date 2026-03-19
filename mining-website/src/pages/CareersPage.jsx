import { Briefcase } from 'lucide-react'
import { CTA } from '../components/CTA.jsx'
import { Reveal } from '../components/Motion.jsx'
import { PageHeader } from '../components/PageHeader.jsx'

export function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Join AppGeo"
        subtitle="We are hiring for detail-focused, compliance-support roles."
        width="wide"
      />

      <section className="container-wide pb-16 md:pb-24">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Reveal>
            <div className="rounded-2xl border border-slate-900/5 dark:border-slate-400/10 bg-white/70 dark:bg-slate-800/50 p-7 backdrop-blur">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[color:var(--brand-700)] to-[color:var(--accent-cyan)] text-white">
                <Briefcase size={18} />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
                Data Entry Operator
              </h2>
              <div className="mt-1 text-sm font-medium text-[color:var(--brand-700)]">Position - 01</div>

              <ul className="mt-5 space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">
                <li>Qualification - UG/PG in any stream (B.Sc., M.Sc.)</li>
                <li>Requirements - Good Communication skills</li>
                <li>Strong knowledge of MS Office Suite</li>
                <li>Basic Analytical data handling skills</li>
                <li>Attention to detail and accuracy</li>
                <li>
                  Send resume to{' '}
                  <a className="link-underline" href="mailto:admin@appgeo.in?subject=Application%20-%20Data%20Entry%20Operator">
                    admin@appgeo.in
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="rounded-2xl border border-slate-900/5 dark:border-slate-400/10 bg-white/60 dark:bg-slate-800/40 p-6 backdrop-blur">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Application checklist</h3>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                <li>Updated resume (PDF)</li>
                <li>Educational qualification details</li>
                <li>Current location and contact number</li>
                <li>Experience in MS Office tools (if any)</li>
              </ul>
              <a className="btn-primary mt-6 inline-flex" href="mailto:admin@appgeo.in?subject=Application%20-%20Data%20Entry%20Operator">
                Email your resume
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <CTA />
    </>
  )
}

