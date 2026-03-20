const rateLimit = require('express-rate-limit')

const isProd = process.env.NODE_ENV === 'production'

// Tune values for your deployment; these defaults are safe for initial rollout.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // 200 requests per IP / window
  standardHeaders: true,
  legacyHeaders: false,
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10, // prevent brute-force against /api/admin/login
  standardHeaders: true,
  legacyHeaders: false,
})

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20, // prevent upload abuse
  standardHeaders: true,
  legacyHeaders: false,
})

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 5 : 20, // throttle OTP brute force (dev needs room for testing)
  standardHeaders: true,
  legacyHeaders: false,
})

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 5 : 20, // throttle password reset attempts (dev needs room for testing)
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  apiLimiter,
  loginLimiter,
  uploadLimiter,
  otpLimiter,
  passwordResetLimiter,
}

