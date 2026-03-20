const express = require('express')

const db = require('../db')
const { requireAuth, requirePermission } = require('../auth/middleware')

const router = express.Router()

function clampInt(value, fallback, min, max) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, Math.trunc(n)))
}

router.get('/career-applications', requireAuth, requirePermission('team.read'), async (req, res) => {
  const limit = clampInt(req.query.limit, 50, 1, 200)
  const openingId = Number(req.query.openingId)

  const query = db('career_applications as ca')
    .leftJoin('career_openings as co', 'ca.opening_id', 'co.id')
    .select(
      'ca.id',
      'ca.full_name as fullName',
      'ca.email',
      'ca.phone',
      'ca.applied_role as appliedRole',
      'ca.education',
      'ca.experience',
      'ca.location',
      'ca.message',
      'ca.resume_url as resumeUrl',
      'ca.created_at as createdAt',
      'ca.opening_id as openingId',
      'co.title as openingTitle',
    )
    .orderBy('ca.created_at', 'desc')
    .limit(limit)
  if (Number.isFinite(openingId) && openingId > 0) query.where('ca.opening_id', openingId)
  const applications = await query

  return res.json({ applications })
})

module.exports = router

