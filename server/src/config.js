const path = require('path')

function num(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
  NODE_ENV,
  PORT: num(process.env.PORT, 4000),

  DB: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    name: process.env.DB_NAME || '',
  },

  JWT_SECRET: process.env.JWT_SECRET || 'dev-change-me',
  COOKIE_NAME: process.env.COOKIE_NAME || 'admin_session',
  COOKIE_MAX_AGE_MS: num(process.env.COOKIE_MAX_AGE_MS, 30 * 24 * 60 * 60 * 1000), // 30 days

  cookieOptions() {
    const secure = NODE_ENV === 'production'
    return {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: module.exports.COOKIE_MAX_AGE_MS,
    }
  },

  UPLOAD_ROOT: path.resolve(
    process.env.UPLOAD_ROOT || path.join(__dirname, '../../mining-website/public/uploads'),
  ),
}

