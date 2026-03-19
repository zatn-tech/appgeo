import { GraduationCap, ShieldCheck, Users } from 'lucide-react'
import { CTA } from '../components/CTA.jsx'
import { Reveal } from '../components/Motion.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { team } from '../content/siteData.js'

const highlights = [
  {
    title: 'Geology + GIS expertise',
    desc: 'Qualified professionals with expertise in Geology, GIS, and regulatory compliance.',
    icon: Users,
  },
  {
    title: 'Quality-focused delivery',
    desc: 'Committed to maintaining the highest standards of quality and delivering reliable, efficient solutions.',
    icon: ShieldCheck,
  },
  {
    title: 'Hands-on project experience',
    desc: 'Experience across quarry, replenishment studies, and minor mineral projects.',
    icon: GraduationCap,
  },
]

export function TeamPage() {
  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="Experienced, cross-functional specialists"
        subtitle="Management team and leadership."
        width="wide"
      />

      <section className="container-wide pb-12 md:pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.05}>
              <div className="rounded-2xl border border-slate-900/5 dark:border-slate-400/10 bg-white/60 dark:bg-slate-800/40 p-6 backdrop-blur">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[color:var(--brand-700)] to-[color:var(--accent-cyan)] text-white">
                  <b.icon size={18} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{b.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-wide pb-16 md:pb-24">
        <div className="divider" />
        <div className="mt-10 grid gap-7 lg:grid-cols-2">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.06}>
              <div className="relative rounded-3xl border border-slate-900/5 dark:border-slate-400/10 bg-white/70 dark:bg-slate-800/50 p-8 md:p-9 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-[0_0_50px_-12px_var(--glow-emerald)]">
                <div className="flex items-center gap-5">
                  {m.photo ? (
                    <img
                      src={m.photo}
                      alt={m.name}
                      className="h-24 w-24 rounded-3xl object-cover ring-2 ring-white/60 dark:ring-slate-700/60"
                      loading="lazy"
                      style={m.photoPosition ? { objectPosition: m.photoPosition } : undefined}
                    />
                  ) : (
                    <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-[color:var(--brand-700)] to-[color:var(--accent-cyan)] text-white">
                      <span className="font-display text-2xl font-bold">
                        {m.name
                          .split(' ')
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join('')}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">
                      {m.name}
                    </div>
                    <div className="mt-1 text-base font-medium text-[color:var(--brand-700)]">
                      {m.role}
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-400">{m.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CTA />
    </>
  )
}
