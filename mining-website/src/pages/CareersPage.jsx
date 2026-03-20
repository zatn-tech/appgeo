import { useEffect, useState } from 'react'
import { Briefcase } from 'lucide-react'
import { CTA } from '../components/CTA.jsx'
import { Reveal } from '../components/Motion.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { apiClient } from '../lib/apiClient.js'

export function CareersPage() {
  const [openings, setOpenings] = useState([])
  const [openingsLoading, setOpeningsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [form, setForm] = useState({
    openingId: '',
    fullName: '',
    email: '',
    phone: '',
    appliedRole: 'Data Entry Operator',
    education: '',
    experience: '',
    location: '',
    message: '',
    resumeUrl: '',
  })
  const [errors, setErrors] = useState({})
  const [resumeFile, setResumeFile] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiClient
      .getCareerOpenings()
      .then((res) => {
        if (cancelled) return
        const list = res?.openings || []
        setOpenings(list)
        setForm((prev) => ({ ...prev, openingId: list[0]?.id ? String(list[0].id) : '' }))
        setOpeningsLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setOpenings([])
        setOpeningsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function validate(nextForm) {
    const nextErrors = {}
    if (!nextForm.fullName.trim()) nextErrors.fullName = 'Full name is required'
    if (!nextForm.openingId) nextErrors.openingId = 'Please select an opening'
    if (!nextForm.email.trim()) nextErrors.email = 'Email is required'
    if (nextForm.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(nextForm.email.trim())) nextErrors.email = 'Enter a valid email'
    if (!nextForm.education.trim()) nextErrors.education = 'Education is required'
    if (nextForm.phone && !/^[+\d][\d\s-]{7,}$/.test(nextForm.phone.trim())) nextErrors.phone = 'Enter a valid phone number'
    return nextErrors
  }

  async function onSubmit(e) {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setStatus('sending')
    try {
      let uploadedResumeUrl = form.resumeUrl || ''
      if (resumeFile) {
        const uploadRes = await apiClient.uploadCareerResume({ file: resumeFile })
        uploadedResumeUrl = uploadRes?.resumeUrl || ''
      }

      await apiClient.submitCareerApplication({
        ...form,
        resumeUrl: uploadedResumeUrl || null,
        openingId: Number(form.openingId),
      })
      setStatus('sent')
      setForm({
        openingId: openings[0]?.id ? String(openings[0].id) : '',
        fullName: '',
        email: '',
        phone: '',
        appliedRole: 'Data Entry Operator',
        education: '',
        experience: '',
        location: '',
        message: '',
        resumeUrl: '',
      })
      setResumeFile(null)
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err?.message || 'Failed to submit application' }))
      setStatus('idle')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Join AppGeo"
        subtitle="We are hiring for detail-focused, compliance-support roles."
        width="wide"
      />

      <section className="container-wide pb-16 md:pb-24">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <div className="rounded-2xl border border-slate-900/5 dark:border-slate-400/10 bg-white/70 dark:bg-slate-800/50 p-7 backdrop-blur">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[color:var(--brand-700)] to-[color:var(--accent-cyan)] text-white">
                <Briefcase size={18} />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
                Current openings
              </h2>
              <div className="mt-1 text-sm font-medium text-[color:var(--brand-700)]">
                Choose an opening, then submit the form
              </div>

              {openingsLoading ? (
                <div className="mt-5 text-sm text-slate-600 dark:text-slate-400">Loading openings…</div>
              ) : openings.length ? (
                <div className="mt-5 grid gap-4">
                  {openings.map((o) => (
                    <div key={o.id} className="rounded-2xl border border-slate-900/10 bg-white/70 p-4 dark:border-slate-400/20 dark:bg-slate-900/30">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{o.title}</div>
                        <span className="chip">{o.employmentType}</span>
                      </div>
                      {o.location ? <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{o.location}</div> : null}
                      {o.summary ? <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{o.summary}</p> : null}
                      {o.requirements ? (
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Requirements:</span>{' '}
                          {o.requirements}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/30 dark:text-amber-100">
                  There are currently no open positions.
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="rounded-2xl border border-slate-900/5 dark:border-slate-400/10 bg-white/60 dark:bg-slate-800/40 p-6 backdrop-blur">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Apply now</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Submit your details below. You can also email your resume to the address on the left.
              </p>

              <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Opening</span>
                  <select
                    className="input-field"
                    value={form.openingId}
                    onChange={(e) => setForm((prev) => ({ ...prev, openingId: e.target.value }))}
                    required
                    disabled={!openings.length}
                  >
                    <option value="">Select opening</option>
                    {openings.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title}
                      </option>
                    ))}
                  </select>
                  {errors.openingId ? (
                    <span className="text-xs text-rose-600 dark:text-rose-400">{errors.openingId}</span>
                  ) : null}
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Full name</span>
                  <input
                    className="input-field"
                    value={form.fullName}
                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                  {errors.fullName ? <span className="text-xs text-rose-600 dark:text-rose-400">{errors.fullName}</span> : null}
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Email</span>
                  <input
                    className="input-field"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    type="email"
                    required
                  />
                  {errors.email ? <span className="text-xs text-rose-600 dark:text-rose-400">{errors.email}</span> : null}
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Phone (optional)</span>
                  <input
                    className="input-field"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 ..."
                  />
                  {errors.phone ? <span className="text-xs text-rose-600 dark:text-rose-400">{errors.phone}</span> : null}
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Education (required)</span>
                  <input
                    className="input-field"
                    value={form.education}
                    onChange={(e) => setForm((prev) => ({ ...prev, education: e.target.value }))}
                    required
                  />
                  {errors.education ? <span className="text-xs text-rose-600 dark:text-rose-400">{errors.education}</span> : null}
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Current location (optional)</span>
                  <input
                    className="input-field"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Experience (optional)</span>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    value={form.experience}
                    onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Message (optional)</span>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Resume (PDF, optional)</span>
                  <input
                    className="input-field file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:file:bg-slate-700"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Max size 5 MB, PDF only.</span>
                </label>

                {errors.form ? <p className="text-xs text-rose-600 dark:text-rose-400">{errors.form}</p> : null}

                <button className="btn-primary" type="submit" disabled={submitting || !openings.length}>
                  {submitting ? 'Submitting…' : status === 'sent' ? 'Submitted' : 'Submit application'}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      <CTA />
    </>
  )
}

