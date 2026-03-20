const express = require('express')
const { z } = require('zod')
const bcrypt = require('bcrypt')

const crypto = require('../utils/security')
const db = require('../db')
const { requireAuth, requirePermission } = require('../auth/middleware')
const { otpLimiter, passwordResetLimiter } = require('../middleware/rateLimiters')
const { writeAuditLog } = require('../utils/audit')
const { isMailConfigured, sendTextMail } = require('../utils/mailer')

const router = express.Router()

const allowedRolesByName = new Set(['super_admin', 'admin', 'manager'])

const createUserSchema = z.object({
  email: z.string().email(),
  // Password is optional for the onboarding flow. If omitted, the user will be
  // activated by OTP later (and the password will be set during confirmation).
  password: z.string().min(6).max(72).optional(),
  role: z.enum(['super_admin', 'admin', 'manager']).optional().default('admin'),
  // Security default: require OTP verification before the user can login.
  requireVerification: z.boolean().optional().default(true),
})

const updateUserSchema = z.object({
  role: z.enum(['super_admin', 'admin', 'manager']).optional(),
  is_active: z.boolean().optional(),
})

const requestVerificationSchema = z.object({
  email: z.string().email(),
})

const confirmVerificationSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(8),
  // If provided, onboarding will both verify email OTP and set password in one step.
  newPassword: z.string().min(6).max(72).optional(),
})

const requestPasswordResetSchema = z.object({
  email: z.string().email(),
})

const confirmPasswordResetSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(8),
  newPassword: z.string().min(6).max(72),
})

function maybeDebugSecret(payload) {
  // Default behavior: never leak OTP/tokens in API responses.
  // If you *explicitly* want debug secrets returned, set:
  //   RETURN_DEBUG_SECRETS=true
  if (process.env.RETURN_DEBUG_SECRETS === 'true') return payload
  return {}

  // In production we avoid returning secrets in the response.
  // If email delivery isn't configured, keep the flow testable via server logs.
  if (!isMailConfigured()) {
    if (payload?.otp) console.log(`[SECURITY][OTP] email verification OTP: ${payload.otp}`)
    if (payload?.token) console.log(`[SECURITY][RESET] password reset token: ${payload.token}`)
  }

  return {}
}

async function sendEmailVerificationOtp({ to, otp }) {
  const subject = 'Your admin email verification code'
  const text = `Your verification code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you did not request this, you can ignore this email.`
  const result = await sendTextMail({ to, subject, text })
  if (!result.sent) return result
  return result
}

async function sendPasswordResetOtp({ to, otp }) {
  const subject = 'Your admin password reset code'
  const text = `Your password reset code is: ${otp}\n\nUse this code to set a new password via the admin login.\n\nThis code expires in 30 minutes.\n\nIf you did not request this, you can ignore this email.`
  const result = await sendTextMail({ to, subject, text })
  if (!result.sent) return result
  return result
}

async function getUserByEmail(email) {
  return db('users as u')
    .select('u.id', 'u.email', 'u.role_id', 'u.is_active', 'u.email_verified_at')
    .where({ 'u.email': email })
    .first()
}

async function getRoleIdByName(roleName) {
  const role = await db('roles').select('id').where({ name: roleName }).first()
  return role?.id ?? null
}

async function getSuperAdminUserId() {
  const superAdminRoleId = await getRoleIdByName('super_admin')
  if (!superAdminRoleId) return null
  const row = await db('users').select('id').where({ role_id: superAdminRoleId }).first()
  return row?.id ?? null
}

router.get('/users', requireAuth, requirePermission('users.read'), async (_req, res) => {
  const users = await db('users as u')
    .join('roles as r', 'u.role_id', 'r.id')
    .select(
      'u.id',
      'u.email',
      'u.role_id',
      'r.name as role_name',
      'u.is_active',
      'u.email_verified_at',
      'u.last_login_at',
    )
    .orderBy('u.id', 'asc')

  return res.json({ users })
})

router.post('/users', requireAuth, requirePermission('users.write'), async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body)
  if (!parsed.success) {
    const generic = 'Invalid user payload'
    if (process.env.NODE_ENV === 'production') return res.status(400).json({ message: generic })

    const details = parsed.error.issues
      .map((i) => `${i.path.join('.') || 'field'}: ${i.message}`)
      .join('; ')
    return res.status(400).json({ message: `${generic}: ${details}` })
  }

  const { email, password, role, requireVerification } = parsed.data

  if (role === 'super_admin') {
    // "Only one superadmin is allowed" (global constraint).
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const existingSuperAdminId = await getSuperAdminUserId()
    if (existingSuperAdminId) {
      return res.status(400).json({ message: 'Only one super admin is allowed' })
    }
  }

  const roleId = await getRoleIdByName(role)
  if (!roleId) return res.status(400).json({ message: 'Invalid role' })

  let passwordHash
  if (password) {
    passwordHash = await bcrypt.hash(password, 12)
  } else {
    // When password is omitted, we create a placeholder hash. The user cannot login
    // until OTP confirmation activates the account and sets the real password.
    if (!requireVerification) {
      return res.status(400).json({ message: 'Password is required when requireVerification is false' })
    }
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const placeholder = crypto.generateOtp({ digits: 10 })
    passwordHash = await bcrypt.hash(placeholder, 12)
  }

  const transactionResult = await db.transaction(async (trx) => {
    // Create user disabled until verification (if requested).
    const userIsActive = Boolean(!requireVerification)

    const [userId] = await trx('users').insert({
      email,
      password_hash: passwordHash,
      role_id: roleId,
      is_active: userIsActive,
      email_verified_at: userIsActive ? trx.fn.now() : null,
    })

    return { userId }
  })

  // Audit: only super_admin should have `users.write`, enforced by RBAC.
  await writeAuditLog({
    actorUserId: req.admin?.id,
    action: 'users.create',
    resourceType: 'user',
    resourceId: transactionResult.userId,
    req,
  })

  return res.status(201).json({
    id: transactionResult.userId,
  })
})

router.put('/users/:id', requireAuth, requirePermission('users.write'), async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })

  const parsed = updateUserSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid update payload' })

  const patch = {}
  if (parsed.data.role) patch.role_id = await getRoleIdByName(parsed.data.role)
  if (parsed.data.is_active !== undefined) patch.is_active = parsed.data.is_active

  if (patch.role_id === null) return res.status(400).json({ message: 'Invalid role' })

  if (parsed.data.role === 'super_admin') {
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const existingSuperAdminId = await getSuperAdminUserId()
    if (existingSuperAdminId && existingSuperAdminId !== id) {
      return res.status(400).json({ message: 'Only one super admin is allowed' })
    }
  }

  if (parsed.data.is_active === false) {
    // Prevent disabling the last active super_admin.
    const targetRole = await db('users as u')
      .join('roles as r', 'u.role_id', 'r.id')
      .select('r.name as role_name')
      .where('u.id', id)
      .first()

    if (targetRole?.role_name === 'super_admin') {
      const countRow = await db('users as u')
        .join('roles as r', 'u.role_id', 'r.id')
        .select(db.raw('COUNT(*) AS c'))
        .where('r.name', 'super_admin')
        .andWhere('u.is_active', true)
        .first()
      if (countRow && Number(countRow.c) <= 1) {
        return res.status(400).json({ message: 'Cannot disable the last active super_admin' })
      }
    }
  }

  await db('users').where({ id }).update(patch)

  await writeAuditLog({
    actorUserId: req.admin?.id,
    action: 'users.update',
    resourceType: 'user',
    resourceId: id,
    req,
  })

  return res.json({ ok: true })
})

router.delete('/users/:id', requireAuth, requirePermission('users.write'), async (req, res) => {
  if (req.admin?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })

  const target = await db('users as u')
    .join('roles as r', 'u.role_id', 'r.id')
    .select('u.id', 'u.email', 'u.is_active', 'r.name as role_name')
    .where('u.id', id)
    .first()

  if (!target) return res.status(404).json({ message: 'User not found' })

  // Soft-disable rather than hard delete so audit logs remain valid.
  try {
    await db.transaction(async (trx) => {
      if (target.role_name === 'super_admin') {
        // Prevent disabling the last active super_admin.
        const countRow = await trx('users as u')
          .join('roles as r', 'u.role_id', 'r.id')
          .select(trx.raw('COUNT(*) AS c'))
          .where('r.name', 'super_admin')
          .andWhere('u.is_active', true)
          .first()

        if (countRow && Number(countRow.c) <= 1) {
          throw new Error('Cannot disable the last active super_admin')
        }
      }

      await trx('users').where({ id }).update({
        is_active: false,
      })

      // Invalidate any outstanding OTP / reset tokens so a disabled user can't re-enable themselves.
      await trx('user_email_verification_otps').where({ user_id: id }).del()
      await trx('user_password_reset_tokens').where({ user_id: id }).del()
    })
  } catch (err) {
    return res.status(400).json({ message: err?.message || 'Disable failed' })
  }

  await writeAuditLog({
    actorUserId: req.admin?.id,
    action: 'users.disable',
    resourceType: 'admin_user',
    resourceId: id,
    req,
  })

  return res.status(204).send()
})

router.post('/users/verification/request', otpLimiter, async (req, res) => {
  const parsed = requestVerificationSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' })

  const { email } = parsed.data
  const user = await getUserByEmail(email)

  if (!user) return res.status(400).json({ message: 'User invalid' })

  // Disabled accounts cannot generate OTPs; treat them as invalid for UX.
  if (!user.is_active && user.email_verified_at) return res.status(400).json({ message: 'User invalid' })

  const otp = crypto.generateOtp({ digits: 6 })
  const otpHash = crypto.sha256Hex(otp)

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  await db('user_email_verification_otps').insert({
    user_id: user.id,
    purpose: 'email_verification',
    otp_hash: otpHash,
    expires_at: expiresAt,
    used_at: null,
    attempts: 0,
  })

  await writeAuditLog({
    actorUserId: null,
    action: 'users.verify.request',
    resourceType: 'admin_user',
    resourceId: user.id,
    req,
  })

  const mailResult = await sendEmailVerificationOtp({ to: user.email, otp })
  if (!mailResult.sent) {
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Failed to send verification email'
        : `Failed to send verification email: ${mailResult.reason || 'unknown error'}`
    return res.status(500).json({ message })
  }

  return res.json({
    ok: true,
    ...maybeDebugSecret({ otp }),
  })
})

router.post('/users/verification/confirm', otpLimiter, async (req, res) => {
  const parsed = confirmVerificationSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' })

  const { email, otp, newPassword } = parsed.data
  const user = await getUserByEmail(email)
  if (!user) return res.status(400).json({ message: 'Invalid OTP' })

  // If the account is disabled (not just pending onboarding), deny confirmation.
  if (!user.is_active && user.email_verified_at) return res.status(400).json({ message: 'Invalid OTP' })

  const otpHash = crypto.sha256Hex(otp)

  const otpRow = await db('user_email_verification_otps')
    .where({ user_id: user.id, purpose: 'email_verification', used_at: null })
    .orderBy('created_at', 'desc')
    .first()

  if (!otpRow) return res.status(400).json({ message: 'Invalid OTP' })

  const now = new Date()
  const expired = new Date(otpRow.expires_at) < now
  const correct = otpRow.otp_hash === otpHash

  if (!correct || expired) {
    await db('user_email_verification_otps')
      .where({ id: otpRow.id })
      .update({ attempts: db.raw('attempts + 1') })
    return res.status(400).json({ message: 'Invalid OTP' })
  }

  // Mark OTP used + activate user.
  await db.transaction(async (trx) => {
    await trx('user_email_verification_otps').where({ id: otpRow.id }).update({ used_at: trx.fn.now() })
    const updates = { is_active: true, email_verified_at: trx.fn.now() }
    if (newPassword) {
      updates.password_hash = await bcrypt.hash(newPassword, 12)
    }
    await trx('users').where({ id: user.id }).update(updates)
  })

  await writeAuditLog({
    actorUserId: null,
    action: 'users.verify.confirm',
    resourceType: 'admin_user',
    resourceId: user.id,
    req,
  })

  return res.json({ ok: true })
})

router.post('/users/password-reset/request', passwordResetLimiter, async (req, res) => {
  const parsed = requestPasswordResetSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' })

  const { email } = parsed.data
  const user = await getUserByEmail(email)
  if (!user) return res.status(400).json({ message: 'User invalid' })

  // Disabled accounts cannot generate reset OTPs; treat them as invalid for UX.
  if (!user.is_active && user.email_verified_at) return res.status(400).json({ message: 'User invalid' })

  const otp = crypto.generateOtp({ digits: 6 })
  const otpHash = crypto.sha256Hex(otp)

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  await db('user_email_verification_otps').insert({
    user_id: user.id,
    purpose: 'password_reset',
    otp_hash: otpHash,
    expires_at: expiresAt,
    used_at: null,
  })

  await writeAuditLog({
    actorUserId: null,
    action: 'users.password_reset.request',
    resourceType: 'admin_user',
    resourceId: user.id,
    req,
  })

  const mailResult = await sendPasswordResetOtp({ to: user.email, otp })
  if (!mailResult.sent) {
    return res.status(500).json({ message: 'Failed to send password reset email' })
  }

  return res.json({
    ok: true,
    ...maybeDebugSecret({ otp }),
  })
})

router.post('/users/password-reset/confirm', passwordResetLimiter, async (req, res) => {
  const parsed = confirmPasswordResetSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' })

  const { email, otp, newPassword } = parsed.data
  const user = await getUserByEmail(email)
  if (!user) return res.status(400).json({ message: 'Invalid OTP' })

  // Disabled accounts cannot reset password via OTP.
  if (!user.is_active && user.email_verified_at) return res.status(400).json({ message: 'Invalid OTP' })

  const otpHash = crypto.sha256Hex(otp)

  const otpRow = await db('user_email_verification_otps')
    .where({ user_id: user.id, purpose: 'password_reset', used_at: null, otp_hash: otpHash })
    .orderBy('created_at', 'desc')
    .first()

  if (!otpRow) return res.status(400).json({ message: 'Invalid OTP' })

  const now = new Date()
  const expired = new Date(otpRow.expires_at) < now
  if (expired) return res.status(400).json({ message: 'Invalid OTP' })

  // In case of incorrect OTP, bump attempts like verification does.
  // (We don't currently store incorrect OTP hash rows since we query by otp_hash,
  // so we only update on a matching row that later expires.)

  const passwordHash = await bcrypt.hash(newPassword, 12)

  await db.transaction(async (trx) => {
    await trx('user_email_verification_otps').where({ id: otpRow.id }).update({ used_at: trx.fn.now() })
    await trx('users').where({ id: user.id }).update({
      password_hash: passwordHash,
      is_active: true,
      email_verified_at: trx.fn.now(),
    })
  })

  await writeAuditLog({
    actorUserId: null,
    action: 'users.password_reset.confirm',
    resourceType: 'admin_user',
    resourceId: user.id,
    req,
  })

  return res.json({ ok: true })
})

module.exports = router

