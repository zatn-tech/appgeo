import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { ADMIN_PERMISSIONS } from '../../auth/adminPermissions'
import { apiClient } from '../../lib/apiClient'

function has(user, key) {
  return Boolean(user?.permissions?.includes(key))
}

function formatWhen(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return String(iso)
  }
}

export function AdminDashboardPage({ user }) {
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState({
    gallery: null,
    team: null,
    openings: null,
    contacts: null,
    applications: null,
    users: null,
    audit: null,
  })

  const can = useMemo(
    () => ({
      gallery: has(user, ADMIN_PERMISSIONS.GALLERY_WRITE),
      team: has(user, ADMIN_PERMISSIONS.TEAM_READ),
      teamWrite: has(user, ADMIN_PERMISSIONS.TEAM_WRITE),
      leads: has(user, ADMIN_PERMISSIONS.TEAM_READ),
      users: has(user, ADMIN_PERMISSIONS.USERS_READ),
    }),
    [user],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const next = {
        gallery: null,
        team: null,
        openings: null,
        contacts: null,
        applications: null,
        users: null,
        audit: null,
      }

      const tasks = []

      if (can.gallery) {
        tasks.push(
          apiClient.getAdminGalleryImages().then((res) => {
            const images = res?.images || []
            const published = images.filter((i) => i.is_published)
            const homeSlides = published.filter((i) => i.is_home_slide)
            next.gallery = {
              total: images.length,
              published: published.length,
              homeSlides: homeSlides.length,
            }
          }),
        )
      }

      if (can.team) {
        tasks.push(
          apiClient.getAdminTeam().then((res) => {
            const team = res?.team || []
            next.team = {
              total: team.length,
              published: team.filter((m) => m.is_published).length,
            }
          }),
        )
        tasks.push(
          apiClient.getAdminCareerOpenings().then((res) => {
            const openings = res?.openings || []
            next.openings = {
              total: openings.length,
              published: openings.filter((o) => o.isPublished).length,
            }
          }),
        )
      }

      if (can.leads) {
        tasks.push(
          apiClient.getAdminContactSubmissions({ limit: 200 }).then((res) => {
            const submissions = res?.submissions || []
            next.contacts = {
              count: submissions.length,
              recent: submissions.slice(0, 5),
            }
          }),
        )
        tasks.push(
          apiClient.getAdminCareerApplications({ limit: 200 }).then((res) => {
            const applications = res?.applications || []
            next.applications = {
              count: applications.length,
              recent: applications.slice(0, 5),
            }
          }),
        )
      }

      if (can.users) {
        tasks.push(
          apiClient.getAdminUsers().then((res) => {
            const users = res?.users || []
            next.users = {
              total: users.length,
              active: users.filter((u) => u.is_active).length,
            }
          }),
        )
        tasks.push(
          apiClient.getAdminAuditLogs({ limit: 12 }).then((res) => {
            next.audit = { items: res?.logs || [] }
          }),
        )
      }

      try {
        await Promise.all(tasks.map((p) => p.catch(() => {})))
      } finally {
        if (!cancelled) {
          setInsights(next)
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [can.gallery, can.team, can.leads, can.users])

  const cards = [
    {
      to: '/admin/settings',
      title: 'Settings',
      desc: 'Site copy, hours, and contact details.',
      permission: ADMIN_PERMISSIONS.SITE_SETTINGS_WRITE,
      hint: 'Public-facing content blocks',
    },
    {
      to: '/admin/team',
      title: 'Team',
      desc: 'Member profiles and visibility on the Team page.',
      permission: ADMIN_PERMISSIONS.TEAM_WRITE,
      stat: insights.team
        ? `${insights.team.published} live · ${insights.team.total} total`
        : null,
    },
    {
      to: '/admin/gallery',
      title: 'Gallery & hero',
      desc: 'Images for the gallery and homepage hero slider.',
      permission: ADMIN_PERMISSIONS.GALLERY_WRITE,
      stat: insights.gallery
        ? `${insights.gallery.homeSlides} in home slider · ${insights.gallery.published} published`
        : null,
    },
    {
      to: '/admin/users',
      title: 'Users',
      desc: 'Admin accounts and roles.',
      permission: ADMIN_PERMISSIONS.USERS_READ,
      stat: insights.users ? `${insights.users.active} active · ${insights.users.total} total` : null,
    },
    {
      to: '/admin/audit-logs',
      title: 'Audit logs',
      desc: 'Security and change history.',
      permission: ADMIN_PERMISSIONS.USERS_READ,
      stat: insights.audit?.items?.length ? `${insights.audit.items.length} recent events loaded` : null,
    },
    {
      to: '/admin/contact-submissions',
      title: 'Contact',
      desc: 'Enquiries from the contact form.',
      permission: ADMIN_PERMISSIONS.TEAM_READ,
      stat: insights.contacts ? `${insights.contacts.count} in last 200` : null,
    },
    {
      to: '/admin/career-openings',
      title: 'Openings',
      desc: 'Published job listings.',
      permission: ADMIN_PERMISSIONS.TEAM_WRITE,
      stat: insights.openings
        ? `${insights.openings.published} live · ${insights.openings.total} total`
        : null,
    },
    {
      to: '/admin/career-applications',
      title: 'Applications',
      desc: 'Candidates and résumés.',
      permission: ADMIN_PERMISSIONS.TEAM_READ,
      stat: insights.applications ? `${insights.applications.count} in last 200` : null,
    },
  ]

  const visibleCards = cards.filter((c) => has(user, c.permission))

  return (
    <div className="mx-auto w-full max-w-6xl py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Signed in as <span className="font-medium text-slate-800 dark:text-slate-200">{user?.email}</span>
            <span className="text-slate-500 dark:text-slate-500"> · </span>
            <span className="font-medium capitalize">{user?.role?.replace(/_/g, ' ')}</span>
          </p>
        </div>
        {loading ? (
          <div className="text-sm text-slate-500 dark:text-slate-400">Refreshing insights…</div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400">Insights reflect your permissions</div>
        )}
      </div>

      {/* At-a-glance stats */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {can.gallery && insights.gallery ? (
          <div className="rounded-2xl border border-slate-900/10 bg-white/70 p-4 dark:border-slate-400/10 dark:bg-slate-800/50">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Gallery
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {insights.gallery.total}
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {insights.gallery.published} published · {insights.gallery.homeSlides} in homepage slider
            </div>
            <Link className="mt-3 inline-block text-sm font-semibold text-[color:var(--brand-700)] hover:underline" to="/admin/gallery">
              Manage gallery →
            </Link>
          </div>
        ) : null}

        {can.leads && (insights.contacts || insights.applications) ? (
          <div className="rounded-2xl border border-slate-900/10 bg-white/70 p-4 dark:border-slate-400/10 dark:bg-slate-800/50">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Inbox (recent)
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700 dark:text-slate-300">
              <span>
                <strong className="tabular-nums text-slate-900 dark:text-slate-100">
                  {insights.contacts?.count ?? '—'}
                </strong>{' '}
                contacts
              </span>
              <span>
                <strong className="tabular-nums text-slate-900 dark:text-slate-100">
                  {insights.applications?.count ?? '—'}
                </strong>{' '}
                applications
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Counts from the latest 200 rows each</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <Link className="text-[color:var(--brand-700)] hover:underline" to="/admin/contact-submissions">
                Contacts →
              </Link>
              <Link className="text-[color:var(--brand-700)] hover:underline" to="/admin/career-applications">
                Applications →
              </Link>
            </div>
          </div>
        ) : null}

        {can.team && insights.openings ? (
          <div className="rounded-2xl border border-slate-900/10 bg-white/70 p-4 dark:border-slate-400/10 dark:bg-slate-800/50">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Careers
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {insights.openings.published}
              <span className="text-lg font-semibold text-slate-500 dark:text-slate-400"> / {insights.openings.total}</span>
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Published openings vs total drafts</div>
            {can.teamWrite ? (
              <Link className="mt-3 inline-block text-sm font-semibold text-[color:var(--brand-700)] hover:underline" to="/admin/career-openings">
                Edit openings →
              </Link>
            ) : null}
          </div>
        ) : null}

        {can.users && insights.users ? (
          <div className="rounded-2xl border border-slate-900/10 bg-white/70 p-4 dark:border-slate-400/10 dark:bg-slate-800/50">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Admin users
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {insights.users.active}
              <span className="text-lg font-semibold text-slate-500 dark:text-slate-400"> / {insights.users.total}</span>
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Active accounts</div>
            <Link className="mt-3 inline-block text-sm font-semibold text-[color:var(--brand-700)] hover:underline" to="/admin/users">
              Manage users →
            </Link>
          </div>
        ) : null}
      </div>

      {/* Recent activity + inbox preview */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {can.leads && (insights.contacts?.recent?.length || insights.applications?.recent?.length) ? (
          <section className="rounded-3xl border border-slate-900/10 bg-white/60 p-5 dark:border-slate-400/10 dark:bg-slate-800/40">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Latest leads</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Newest contact messages and applications</p>
            <div className="mt-4 space-y-4">
              {insights.contacts?.recent?.length ? (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Contact
                  </div>
                  <ul className="mt-2 divide-y divide-slate-900/10 dark:divide-slate-400/10">
                    {insights.contacts.recent.map((s) => (
                      <li key={s.id} className="py-2 text-sm">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{s.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{formatWhen(s.createdAt)}</div>
                        <div className="mt-0.5 line-clamp-2 text-slate-600 dark:text-slate-400">{s.need}</div>
                      </li>
                    ))}
                  </ul>
                  <Link className="mt-2 inline-block text-sm font-semibold text-[color:var(--brand-700)] hover:underline" to="/admin/contact-submissions">
                    View all contacts
                  </Link>
                </div>
              ) : null}
              {insights.applications?.recent?.length ? (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Applications
                  </div>
                  <ul className="mt-2 divide-y divide-slate-900/10 dark:divide-slate-400/10">
                    {insights.applications.recent.map((a) => (
                      <li key={a.id} className="py-2 text-sm">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{a.fullName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {a.openingTitle || a.appliedRole || 'Role TBD'} · {formatWhen(a.createdAt)}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Link className="mt-2 inline-block text-sm font-semibold text-[color:var(--brand-700)] hover:underline" to="/admin/career-applications">
                    View all applications
                  </Link>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {can.users && insights.audit?.items?.length ? (
          <section className="rounded-3xl border border-slate-900/10 bg-white/60 p-5 dark:border-slate-400/10 dark:bg-slate-800/40">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent admin activity</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">From audit log (newest first)</p>
            <ul className="mt-4 divide-y divide-slate-900/10 dark:divide-slate-400/10">
              {insights.audit.items.map((log) => (
                <li key={log.id} className="py-2.5 text-sm">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">{log.action}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {log.resourceType}
                      {log.resourceId != null && log.resourceId !== '' ? ` #${log.resourceId}` : ''}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {log.actorEmail || 'system'} · {formatWhen(log.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
            <Link className="mt-3 inline-block text-sm font-semibold text-[color:var(--brand-700)] hover:underline" to="/admin/audit-logs">
              Open full audit log →
            </Link>
          </section>
        ) : null}
      </div>

      {/* Quick links */}
      <h2 className="mt-12 text-lg font-semibold text-slate-900 dark:text-slate-100">Quick links</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Jump to a section you manage</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="glass-panel card-glow rounded-3xl border border-slate-900/5 p-5 transition hover:border-[color:var(--brand-600)]/30 dark:border-slate-200/10"
          >
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{card.title}</div>
            {card.stat ? (
              <div className="mt-2 rounded-xl bg-slate-900/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-100/5 dark:text-slate-300">
                {card.stat}
              </div>
            ) : null}
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">{card.desc}</div>
            {card.hint ? <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">{card.hint}</div> : null}
          </Link>
        ))}
      </div>
    </div>
  )
}
