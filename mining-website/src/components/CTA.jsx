import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-emerald-50/50 to-transparent dark:via-emerald-900/10" />
      <div className="container-page">
        <div className="rounded-3xl border border-slate-900/5 dark:border-slate-400/10 bg-white/60 dark:bg-slate-800/40 p-8 backdrop-blur md:p-12">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="kicker">Next step</div>
              <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">
                Need Survey, Mine Planning, Documentation, or Environmental Clearance (EC) approval support?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">
                Share your site location, mineral type, and requirement.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link className="btn-primary" to="/contact">
                Contact us <ArrowRight size={16} />
              </Link>
              <Link className="btn-ghost" to="/services">
                Browse services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
