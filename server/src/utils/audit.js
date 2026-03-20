const db = require('../db')
const { logError } = require('./logger')

async function writeAuditLog({ actorUserId, action, resourceType, resourceId, req }) {
  try {
    await db('audit_logs').insert({
      actor_user_id: actorUserId ?? null,
      action,
      resource_type: resourceType ?? null,
      resource_id: resourceId ? String(resourceId) : null,
      ip_address: req?.ip ? String(req.ip).slice(0, 64) : null,
      user_agent: req?.headers?.['user-agent'] ? String(req.headers['user-agent']).slice(0, 2000) : null,
    })
  } catch (err) {
    // Audit logging should never take down the API.
    logError(err, { action, resourceType, resourceId })
  }
}

module.exports = { writeAuditLog }

