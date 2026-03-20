import { GraduationCap, ShieldCheck, Users } from 'lucide-react'
import { CTA } from '../components/CTA.jsx'
import { Reveal } from '../components/Motion.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { team as teamFallback } from '../content/siteData.js'
import { useTeam } from '../hooks/usePublicContent.js'

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

/** Legacy: "Managing Director (MSc, MBA, PhD)" */
function parseRoleCombined(role) {
  const r = String(role || '').trim()
  if (!r) return { position: '', education: '' }
  const match = r.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
  if (!match) return { position: r, education: '' }
  return { position: match[1].trim(), education: match[2].trim() }
}

/**
 * Public order: Name → Education → Position (role).
 * Prefer API fields `education` + `role` (position); fall back to parsing combined legacy `role`.
 */
function getMemberDisplay(member) {
  const eduFromApi = member.education != null ? String(member.education).trim() : ''
  const roleRaw = String(member.role || '').trim()

  if (eduFromApi) {
    return {
      education: eduFromApi,
      position: roleRaw,
    }
  }

  const parsed = parseRoleCombined(roleRaw)
  return {
    education: parsed.education,
    position: parsed.position || roleRaw,
  }
}

function enhanceBio(member) {
  // Keep the member's bio text as authored; only normalize punctuation/whitespace.
  // (Specifically: do not auto-prefix with the member's name.)
  let b = String(member?.bio || '').trim()
  if (!b) return ''
  if (!/[.!?]$/.test(b)) b += '.'
  return b
}

export function TeamPage() {
  const { data } = useTeam(teamFallback)
  const team = data?.team || teamFallback

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
          {team.map((m, i) => {
            const display = getMemberDisplay(m)
            const bioEnhanced = enhanceBio(m)
            const photoClass =
              'h-28 w-28 rounded-3xl object-contain ring-2 ring-white/60 dark:ring-slate-700/60 md:h-32 md:w-32'

            return (
              <Reveal key={m.name} delay={i * 0.06}>
                <article className="relative rounded-3xl border border-slate-900/5 dark:border-slate-400/10 bg-white/70 dark:bg-slate-800/50 p-6 md:p-7 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-[0_0_50px_-12px_var(--glow-emerald)]">
                  {/* Order: Name → Education → Position → photo → bio (mobile). Desktop: photo left, then same text order + bio. */}
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-8">
                    <div className="hidden shrink-0 md:block">
                      {m.photo ? (
                        <img
                          src={m.photo}
                          alt={m.name}
                          className={photoClass}
                          loading="lazy"
                          style={m.photoPosition ? { objectPosition: m.photoPosition } : undefined}
                        />
                      ) : (
                        <div
                          className={`grid place-items-center bg-gradient-to-br from-[color:var(--brand-700)] to-[color:var(--accent-cyan)] text-white ${photoClass}`}
                        >
                          <span className="font-display text-2xl font-bold">
                            {m.name
                              .split(' ')
                              .slice(0, 2)
                              .map((p) => p[0])
                              .join('')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <header className="space-y-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">
                            {m.name}
                          </h2>
                          {display.education ? (
                            <span className="text-sm font-semibold text-[color:var(--brand-700)] dark:text-emerald-300/95 md:text-base">
                              {display.education}
                            </span>
                          ) : null}
                        </div>
                        {display.position ? (
                          <p className="text-base font-semibold text-slate-800 dark:text-slate-200 md:text-lg">
                            {display.position}
                          </p>
                        ) : null}
                      </header>

                      <div className="mt-5 flex justify-center md:hidden">
                        {m.photo ? (
                          <img
                            src={m.photo}
                            alt={m.name}
                            className={photoClass}
                            loading="lazy"
                            style={m.photoPosition ? { objectPosition: m.photoPosition } : undefined}
                          />
                        ) : (
                          <div
                            className={`grid place-items-center bg-gradient-to-br from-[color:var(--brand-700)] to-[color:var(--accent-cyan)] text-white ${photoClass}`}
                          >
                            <span className="font-display text-2xl font-bold">
                              {m.name
                                .split(' ')
                                .slice(0, 2)
                                .map((p) => p[0])
                                .join('')}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400 md:mt-5 md:text-sm">
                        {bioEnhanced}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      <CTA />
    </>
  )
}
