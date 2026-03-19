import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Logo } from './Logo.jsx'
import { nav, site } from '../content/siteData.js'

export function Footer() {
  return (
    <footer className="footer-glass relative">
      <div className="container-page py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-10">
          <div>
            <Logo size={44} className="mb-3" />
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">{site.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {site.badges.map((b) => (
                <span key={b} className="pill">
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Quick links</div>
            <div className="mt-3 grid gap-1">
              {nav.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-400/10 dark:hover:text-slate-100 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/contact"
                className="rounded-lg px-2 py-1.5 text-sm font-semibold text-[color:var(--brand-700)] hover:bg-slate-900/5 dark:hover:bg-slate-400/10 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="sm:col-span-2 md:col-span-1">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Get in touch</div>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 dark:text-slate-400">
              <a href={`tel:${site.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2.5 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                <Phone size={15} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
                {site.phone}
              </a>
              <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                <Mail size={15} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
                {site.email}
              </a>
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                <span className="grid gap-0.5">
                  {site.address.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
              </div>
              <div className="rounded-xl bg-slate-900/5 dark:bg-slate-400/10 p-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Office hours</div>
                <ul className="mt-1 space-y-0.5">
                  {site.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-900/10 dark:border-slate-400/10 pt-5">
          <div className="flex flex-col gap-3 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} {site.name}. All rights reserved.</div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span>{site.domain}</span>
              <span className="hidden h-3 w-px bg-slate-300 dark:bg-slate-600 sm:inline-block" />
              <span>
                Designed & developed by{' '}
                <a
                  href="https://wa.me/919790634524"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-700 hover:text-[color:var(--brand-700)] dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
                >
                  Zatn
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
