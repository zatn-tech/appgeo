const nodemailer = require('nodemailer')
const { logError } = require('./logger')

function getEnv(name) {
  return process.env[name] ? String(process.env[name]).trim() : ''
}

const SMTP_HOST = getEnv('SMTP_HOST')
const SMTP_PORT = Number(process.env.SMTP_PORT || '')
const SMTP_USER = getEnv('SMTP_USER')
const SMTP_PASS = getEnv('SMTP_PASS')
const SMTP_FROM_EMAIL = getEnv('SMTP_FROM_EMAIL')
const SMTP_FROM_NAME = getEnv('SMTP_FROM_NAME')

function isMailConfigured() {
  return Boolean(
    SMTP_HOST &&
      Number.isFinite(SMTP_PORT) &&
      SMTP_PORT > 0 &&
      SMTP_USER &&
      SMTP_PASS &&
      SMTP_FROM_EMAIL,
  )
}

function createTransport() {
  const secure = SMTP_PORT === 465

  // Allow bypassing TLS verification in dev when the SMTP server has an expired/misconfigured cert chain.
  // You can force behavior via SMTP_REJECT_UNAUTHORIZED=false/true.
  const explicitRejectUnauthorized = process.env.SMTP_REJECT_UNAUTHORIZED
  const rejectUnauthorized =
    explicitRejectUnauthorized !== undefined && explicitRejectUnauthorized !== ''
      ? explicitRejectUnauthorized !== 'false'
      : process.env.NODE_ENV === 'production'

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure,
    tls: {
      rejectUnauthorized,
    },
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

async function sendTextMail({ to, subject, text }) {
  if (!isMailConfigured()) {
    return { sent: false, reason: 'SMTP not configured' }
  }

  const from = SMTP_FROM_NAME ? `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>` : SMTP_FROM_EMAIL
  const transport = createTransport()
  try {
    await transport.sendMail({
      from,
      to,
      subject,
      text,
    })

    return { sent: true }
  } catch (err) {
    // Never crash OTP flows; DNS/network/auth issues should not take down the API.
    logError(err, { emailTo: to, mailSubject: subject })
    return {
      sent: false,
      reason: err?.message || 'Failed to send email',
      code: err?.code || null,
    }
  }
}

module.exports = {
  isMailConfigured,
  sendTextMail,
}

