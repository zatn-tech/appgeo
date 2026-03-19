import { useMemo, useState } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Reveal } from '../components/Motion.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { site } from '../content/siteData.js'

export function ContactPage() {
  const [status, setStatus] = useState('idle')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', need: '' })
  const [errors, setErrors] = useState({})

  const mailto = useMemo(() => {
    const subject = encodeURIComponent('Enquiry: Mining / Survey / Documentation')
    const body = encodeURIComponent(
      [
        'Hello,',
        '',
        'I would like to enquire about:',
        '- Location:',
        '- Mineral / unit type:',
        '- Timeline:',
        '- Required deliverables:',
        '',
        'Thanks,',
      ].join('\n'),
    )
    return `mailto:${site.email}?subject=${subject}&body=${body}`
  }, [site.email])

  function validate(nextForm) {
    const nextErrors = {}
    if (!nextForm.name.trim()) nextErrors.name = 'Name is required'
    if (nextForm.phone && !/^[+\d][\d\s-]{7,}$/.test(nextForm.phone.trim())) {
      nextErrors.phone = 'Enter a valid phone number'
    }
    if (!nextForm.need.trim()) nextErrors.need = 'Please describe your requirement'
    return nextErrors
  }

  function onSubmit(e) {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setStatus('sent')
    setTimeout(() => {
      setStatus('idle')
      setSubmitting(false)
      setForm({ name: '', phone: '', need: '' })
    }, 1200)
  }

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Need Survey, Mine Planning, Documentation, or RC approval support?"
        subtitle="Get in touch with AppGeo for compliance-first project support."
        width="wide"
      />

      <section className="container-wide pb-16 md:pb-24">
        <div className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <div>
              <div className="kicker">Send an enquiry</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">
                Share your requirement and contact details.
              </p>

              <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    required
                    className="input-field"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name ? <p className="text-xs text-rose-600 dark:text-rose-400">{errors.name}</p> : null}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    id="phone"
                    className="input-field"
                    placeholder="+91 ..."
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone ? <p className="text-xs text-rose-600 dark:text-rose-400">{errors.phone}</p> : null}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="need">
                    Requirement
                  </label>
                  <textarea
                    id="need"
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Briefly describe your location, mineral/unit type, and what you need."
                    value={form.need}
                    onChange={(e) => setForm((prev) => ({ ...prev, need: e.target.value }))}
                    aria-invalid={Boolean(errors.need)}
                  />
                  {errors.need ? <p className="text-xs text-rose-600 dark:text-rose-400">{errors.need}</p> : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button className="btn-primary" type="submit" disabled={submitting}>
                    {submitting ? 'Sending...' : status === 'sent' ? 'Sent' : 'Send message'}
                  </button>
                  <a className="btn-ghost" href={mailto}>
                    Or email us
                  </a>
                </div>
              </form>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div>
              <div className="kicker">Contact details</div>
              <div className="mt-4 grid gap-4 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex gap-3">
                  <Phone size={16} className="mt-0.5 shrink-0 text-[color:var(--brand-700)]" />
                  <span>{site.phone}</span>
                </div>
                <div className="flex gap-3">
                  <Mail size={16} className="mt-0.5 shrink-0 text-[color:var(--brand-700)]" />
                  <span>{site.email}</span>
                </div>
                <div className="flex gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[color:var(--brand-700)]" />
                  <span className="grid gap-0.5">
                    {site.address.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                </div>
              </div>

              <div className="mt-6 text-sm text-slate-700 dark:text-slate-300">
                Website:{' '}
                <a
                  className="link-underline"
                  href={`https://${site.domain}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {site.domain}
                </a>
              </div>
              <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                Map:{' '}
                <a className="link-underline" href={site.mapUrl} target="_blank" rel="noreferrer">
                  Open location
                </a>
              </div>

              <div className="mt-8 divider" />

              <div className="mt-8">
                <div className="kicker">Service area</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 md:text-base">
                  Tamil Nadu
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Dharmapuri', 'Salem', 'Namakkal', 'Karur', 'Erode'].map((d) => (
                    <span key={d} className="pill">{d}</span>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-900/5 dark:border-slate-400/10 bg-white/60 dark:bg-slate-800/40 p-5">
                <div className="kicker">Careers</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Interested in joining our geology, GIS, mine-planning, or documentation team?
                  Share your resume at{' '}
                  <a href={`mailto:${site.email}?subject=Career%20Application%20-%20AppGeo`} className="link-underline">
                    {site.email}
                  </a>
                  .
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
