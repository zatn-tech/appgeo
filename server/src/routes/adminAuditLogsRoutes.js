const express = require('express')

const db = require('../db')
const { requireAuth, requirePermission } = require('../auth/middleware')

const router = express.Router()

function clampInt(value, fallback, min, max) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, Math.trunc(n)))
}

router.get('/audit-logs', requireAuth, requirePermission('users.read'), async (req, res) => {
  const limit = clampInt(req.query.limit, 50, 1, 200)
  const cursor = req.query.cursor
    ? Number(req.query.cursor)
    : null
  const cursorOk = cursor !== null && Number.isFinite(cursor) ? cursor : null

  const action = typeof req.query.action === 'string' ? req.query.action : null
  const resourceType = typeof req.query.resourceType === 'string' ? req.query.resourceType : null
  const resourceId = typeof req.query.resourceId === 'string' ? req.query.resourceId : null
  const actorUserId = Number.isFinite(Number(req.query.actorUserId)) ? Number(req.query.actorUserId) : null

  // Default admin view should not expose IPs (sensitive data).
  // If you *explicitly* request IPs, only `super_admin` is allowed.
  const includeIp = req.query.includeIp === 'true' && req.admin?.role === 'super_admin'

  const query = db('audit_logs as al')
    .leftJoin('users as u', 'al.actor_user_id', 'u.id')
    .leftJoin('roles as r', 'u.role_id', 'r.id')

  const selectFields = [
    'al.id',
    'al.action',
    'al.resource_type as resourceType',
    'al.resource_id as resourceId',
    'u.email as actorEmail',
    'r.name as actorRole',
    'al.created_at as createdAt',
  ]
  if (includeIp) selectFields.push('al.ip_address as ipAddress')

  query.select(...selectFields)
    .orderBy('al.id', 'desc')
    .modify((qb) => {
      if (cursorOk != null) qb.where('al.id', '<', cursorOk)
    })
    .limit(limit)

  if (action) query.where('al.action', action)
  if (resourceType) query.where('al.resource_type', resourceType)
  if (resourceId) query.where('al.resource_id', resourceId)
  if (actorUserId) query.where('al.actor_user_id', actorUserId)

  const logs = await query
  const nextCursor = logs.length === limit ? logs[logs.length - 1].id : null
  return res.json({ logs, nextCursor })
})

module.exports = router

