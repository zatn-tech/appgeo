const express = require('express')
const { z } = require('zod')

const db = require('../../src/db')
const { requireAuth, requirePermission } = require('../auth/middleware')
const { writeAuditLog } = require('../utils/audit')
const { safeStringify, parsePossiblyJson } = require('../utils/json')

const router = express.Router()

const settingsBodySchema = z.record(z.unknown())

router.get('/settings', requireAuth, requirePermission('site_settings.read'), async (_req, res) => {
  if (_req.admin?.role !== 'super_admin') return res.status(403).json({ message: 'Forbidden' })
  const rows = await db('site_settings').select('key', 'value')
  const result = {}
  for (const row of rows) result[row.key] = parsePossiblyJson(row.value)

  return res.json({
    ...result,
  })
})

router.put('/settings', requireAuth, requirePermission('site_settings.write'), async (req, res) => {
  if (req.admin?.role !== 'super_admin') return res.status(403).json({ message: 'Forbidden' })
  const parsed = settingsBodySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid settings payload' })

  const incoming = parsed.data
  const keys = Object.keys(incoming)
  if (!keys.length) return res.status(400).json({ message: 'No settings keys provided' })

  await db('site_settings').transaction(async (trx) => {
    for (const key of keys) {
      const value = incoming[key]
      const valueText = safeStringify(value)

      const existing = await trx('site_settings').select('key').where({ key }).first()
      if (existing) {
        await trx('site_settings').where({ key }).update({ value: valueText })
      } else {
        await trx('site_settings').insert({ key, value: valueText })
      }
    }
  })

  await writeAuditLog({
    actorUserId: req.admin?.id,
    action: 'settings.update',
    resourceType: 'site_settings',
    resourceId: 'bulk',
    req,
  })

  return res.status(200).json({ ok: true })
})

module.exports = router

