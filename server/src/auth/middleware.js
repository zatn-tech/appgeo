const { COOKIE_NAME } = require('../config')
const db = require('../db')
const { verifyAdminToken } = require('./session')

async function loadAdminContext(userId) {
  const user = await db('users as u')
    .select(
      'u.id',
      'u.email',
      'u.is_active',
      'u.role_id',
      'u.updated_at as updatedAt',
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
    roleId: user.role_id,
    permissions: permissions.map((p) => p.key),
    isActive: Boolean(user.is_active),
    updatedAt: user.updatedAt || null,
  }
}

function requireAuth(req, res, next) {
  return (async () => {
    try {
      const token = req.cookies?.[COOKIE_NAME]
      if (!token) return res.status(401).json({ message: 'Unauthorized' })

      const payload = verifyAdminToken(token)
      const userId = payload.sub
      if (!userId) return res.status(401).json({ message: 'Unauthorized' })

      const admin = await loadAdminContext(userId)
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      // Invalidate sessions after sensitive updates (like password reset).
      // JWT contains `iat` (issued-at) by default; if the user was updated after token issuance,
      // require re-login.
      if (payload?.iat && admin.updatedAt) {
        const issuedAtMs = Number(payload.iat) * 1000
        const updatedAtMs = new Date(admin.updatedAt).getTime()
        if (Number.isFinite(issuedAtMs) && Number.isFinite(updatedAtMs) && updatedAtMs > issuedAtMs) {
          return res.status(401).json({ message: 'Unauthorized' })
        }
      }

      req.admin = admin
      return next()
    } catch {
      return res.status(401).json({ message: 'Unauthorized' })
    }
  })()
}

function requirePermission(permissionKey) {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ message: 'Unauthorized' })
    if (!req.admin.permissions?.includes(permissionKey)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    return next()
  }
}

module.exports = {
  requireAuth,
  requirePermission,
}

