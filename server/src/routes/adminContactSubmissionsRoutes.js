const express = require('express')

const db = require('../db')
const { requireAuth, requirePermission } = require('../auth/middleware')

const router = express.Router()

function clampInt(value, fallback, min, max) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, Math.trunc(n)))
}

router.get('/contact-submissions', requireAuth, requirePermission('team.read'), async (req, res) => {
  const limit = clampInt(req.query.limit, 50, 1, 200)

  const submissions = await db('contact_us_submissions')
    .select('id', 'name', 'phone', 'need', 'created_at as createdAt')
    .orderBy('created_at', 'desc')
    .limit(limit)

  return res.json({ submissions })
})

module.exports = router

