const crypto = require('crypto')

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex')
}

function generateOtp({ digits = 6 } = {}) {
  const max = 10 ** digits
  const n = crypto.randomInt(0, max)
  return String(n).padStart(digits, '0')
}

function generateResetToken({ bytes = 32 } = {}) {
  return crypto.randomBytes(bytes).toString('hex')
}

module.exports = {
  sha256Hex,
  generateOtp,
  generateResetToken,
}

