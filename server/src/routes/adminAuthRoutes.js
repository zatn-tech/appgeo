const express = require('express')
const bcrypt = require('bcrypt')
const { z } = require('zod')

const db = require('../db')
const { COOKIE_NAME, cookieOptions } = require('../config')
const { signAdminToken } = require('../auth/session')
const { requireAuth } = require('../auth/middleware')
const { loginLimiter } = require('../middleware/rateLimiters')
const { writeAuditLog } = require('../utils/audit')

const router = express.Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
})

async function loadAdminContextByUserId(userId) {
  const user = await db('users as u')
    .select(
      'u.id',
      'u.email',
      'u.is_active',
      'u.role_id',
      'r.name as role_name',
    )
    .join('roles as r', 'u.role_id', 'r.id')
    .where('u.id', userId)
    .first()

  if (!user) return null

  const permissions = await db('role_permissions as rp')
    .join('permissions as p', 'rp.permission_id', 'p.id')
    .where('rp.role_id', user.role_id)
    .select('p.key')

  return {
    id: user.id,
    email: user.email,
    role: user.role_name,
    permissions: permissions.map((p) => p.key),
    isActive: Boolean(user.is_active),
  }
}

router.post('/login', loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' })

  const { email, password } = parsed.data

  const allowedRoles = new Set(['super_admin', 'admin', 'manager'])

  const userRow = await db('users as u')
    .select('u.id', 'u.email', 'u.password_hash', 'u.is_active', 'u.role_id')
    .select('r.name as role_name')
    .join('roles as r', 'u.role_id', 'r.id')
    .where('u.email', email)
    .first()

  if (!userRow || !userRow.is_active) {
    await writeAuditLog({
      actorUserId: null,
      action: 'login.failure',
      resourceType: 'admin_auth',
      resourceId: email,
      req,
    })
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  if (!allowedRoles.has(userRow.role_name)) {
    await writeAuditLog({
      actorUserId: userRow.id,
      action: 'login.forbidden',
      resourceType: 'admin_auth',
      resourceId: userRow.id,
      req,
    })
    // Avoid leaking whether the email exists if the account has an unexpected role.
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const ok = await bcrypt.compare(password, userRow.password_hash)
  if (!ok) {
    await writeAuditLog({
      actorUserId: userRow.id,
      action: 'login.failure',
      resourceType: 'admin_auth',
      resourceId: userRow.id,
      req,
    })
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  await db('users').where({ id: userRow.id }).update({ last_login_at: db.fn.now() })

  const token = signAdminToken({ userId: userRow.id, roleId: userRow.role_id })
  res.cookie(COOKIE_NAME, token, cookieOptions())

  const admin = await loadAdminContextByUserId(userRow.id)
  await writeAuditLog({
    actorUserId: userRow.id,
    action: 'login.success',
    resourceType: 'admin_auth',
    resourceId: userRow.id,
    req,
  })
  return res.json({ user: admin })
})

router.post('/logout', requireAuth, async (_req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions())
  return res.status(204).send()
})

router.get('/me', requireAuth, async (req, res) => {
  return res.json({ user: req.admin })
})

module.exports = router

