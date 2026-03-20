import { useEffect, useMemo, useState } from 'react'

import { apiClient } from '../../lib/apiClient'
import { useAdminToast } from '../../components/admin/ToastProvider.jsx'

const EDIT_KEYS = ['site', 'about', 'nav', 'quickStats', 'solutions', 'services', 'projects']

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState(null)
  const [draftTextByKey, setDraftTextByKey] = useState({})
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const { pushToast } = useAdminToast()

  const sections = useMemo(
    () =>
      EDIT_KEYS.map((k) => ({
        key: k,
        title: k,
      })),
    [],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    apiClient
      .getAdminSettings()
      .then((res) => {
        if (cancelled) return
        setData(res)
        const drafts = {}
        for (const k of EDIT_KEYS) {
          drafts[k] = JSON.stringify(res?.[k] ?? null, null, 2)
        }
        setDraftTextByKey(drafts)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Failed to load settings')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  function setDraft(key, value) {
    setDraftTextByKey((prev) => ({ ...prev, [key]: value }))
  }

  async function onSave() {
    setSaveError('')
    setSuccessMsg('')
    setSaving(true)
    try {
      const payload = {}
      for (const key of EDIT_KEYS) {
        const text = draftTextByKey[key] ?? 'null'
        try {
          payload[key] = JSON.parse(text)
        } catch {
          throw new Error(`Invalid JSON for "${key}"`)
        }
      }

      await apiClient.updateAdminSettings(payload)
      setSuccessMsg('Settings saved. Public pages will update after reload.')

      // Refresh data to keep UI consistent.
      const refreshed = await apiClient.getAdminSettings()
      setData(refreshed)
      const drafts = {}
      for (const k of EDIT_KEYS) drafts[k] = JSON.stringify(refreshed?.[k] ?? null, null, 2)
      setDraftTextByKey(drafts)
    } catch (err) {
      setSaveError(err?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!error) return
    pushToast({ type: 'error', message: error })
    setError('')
  }, [error, pushToast])

  useEffect(() => {
    if (!saveError) return
    pushToast({ type: 'error', message: saveError })
    setSaveError('')
  }, [saveError, pushToast])

  useEffect(() => {
    if (!successMsg) return
    pushToast({ type: 'success', message: successMsg })
    setSuccessMsg('')
  }, [successMsg, pushToast])

  return (
    <div className="mx-auto w-full max-w-5xl py-12">
      <h2 className="section-title">
        Site Settings
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Edit the JSON objects used by the site. Save updates will be reflected on the public pages
        that fetch from <code>/api/settings</code>.
      </p>

      {loading ? (
        <div className="mt-8 text-sm text-slate-600 dark:text-slate-400">Loading…</div>
      ) : null}

      {data ? (
        <>
          <div className="mt-8 grid gap-6">
            {sections.map(({ key, title }) => (
              <section key={key} className="rounded-3xl border border-slate-900/5 bg-white/60 p-5 backdrop-blur dark:border-slate-400/10 dark:bg-slate-800/40">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                <textarea
                  className="mt-3 min-h-[180px] w-full rounded-xl border border-slate-900/10 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-[color:var(--brand-600)] focus:ring-1 focus:ring-[color:var(--accent-cyan)] dark:border-slate-400/20 dark:bg-slate-800/60 dark:text-slate-100"
                  value={draftTextByKey[key] ?? ''}
                  onChange={(e) => setDraft(key, e.target.value)}
                  spellCheck={false}
                />
              </section>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <button className="btn-primary btn w-fit" type="button" onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}

