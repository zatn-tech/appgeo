const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config')

function signAdminToken({ userId, roleId }) {
  // Keep payload minimal; re-fetch role + permissions from DB per request.
  return jwt.sign({ sub: userId, roleId }, JWT_SECRET, { expiresIn: '30d' })
}

function verifyAdminToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

module.exports = {
  signAdminToken,
  verifyAdminToken,
}

