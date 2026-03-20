const express = require('express')
const { z } = require('zod')

const db = require('../../src/db')
const { requireAuth, requirePermission } = require('../auth/middleware')
const { writeAuditLog } = require('../utils/audit')
const { safeStringify } = require('../utils/json')
const { uploadTeamPhoto } = require('../middleware/teamPhotoUpload')

const router = express.Router()

const teamPayloadSchema = z.object({
  name: z.string().min(1).max(120),
  role: z.string().max(120).optional().default(''),
  education: z.string().max(500).optional().default(''),
  bio: z.string().optional().default(''),
  photo_url: z.string().optional().default(''),
  photoPosition: z.string().optional().default(''),
  sort_order: z.number().int().optional().default(0),
  is_published: z.boolean().optional().default(true),
})

router.get('/team', requireAuth, requirePermission('team.read'), async (_req, res) => {
  const members = await db('team_members')
    .select('id', 'name', 'role', 'education', 'bio', 'photo_url', 'photo_position', 'sort_order', 'is_published')
    .orderBy('sort_order', 'asc')

  return res.json({
    team: members.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      education: m.education || '',
      bio: m.bio,
      photo: m.photo_url,
      photoPosition: m.photo_position,
      sort_order: m.sort_order,
      is_published: Boolean(m.is_published),
    })),
  })
})

router.post('/team', requireAuth, requirePermission('team.write'), async (req, res) => {
  const parsed = teamPayloadSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid team payload' })

  const payload = parsed.data
  const insertPayload = {
    name: payload.name,
    role: payload.role,
    education: payload.education || '',
    bio: payload.bio,
    photo_url: payload.photo_url,
    photo_position: payload.photoPosition,
    sort_order: payload.sort_order,
    is_published: payload.is_published,
  }

  const [id] = await db('team_members').insert(insertPayload)

  await writeAuditLog({
    actorUserId: req.admin?.id,
    action: 'team.create',
    resourceType: 'team_member',
    resourceId: id,
    req,
  })

  return res.status(201).json({ id })
})

router.put('/team/:id', requireAuth, requirePermission('team.write'), async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })

  const parsed = teamPayloadSchema
    .partial()
    .extend({
      name: teamPayloadSchema.shape.name.optional(),
    })
    .safeParse(req.body)

  if (!parsed.success) return res.status(400).json({ message: 'Invalid team payload' })

  const incoming = parsed.data

  const patch = {}
  if (Object.prototype.hasOwnProperty.call(req.body, 'name')) patch.name = incoming.name
  if (Object.prototype.hasOwnProperty.call(req.body, 'role')) patch.role = incoming.role
  if (Object.prototype.hasOwnProperty.call(req.body, 'education'))
    patch.education = incoming.education || ''
  if (Object.prototype.hasOwnProperty.call(req.body, 'bio')) patch.bio = incoming.bio
  if (Object.prototype.hasOwnProperty.call(req.body, 'photo_url')) patch.photo_url = incoming.photo_url
  if (Object.prototype.hasOwnProperty.call(req.body, 'photoPosition'))
    patch.photo_position = incoming.photoPosition
  if (Object.prototype.hasOwnProperty.call(req.body, 'sort_order')) patch.sort_order = incoming.sort_order
  if (Object.prototype.hasOwnProperty.call(req.body, 'is_published')) patch.is_published = incoming.is_published

  await db('team_members').where({ id }).update(patch)

  await writeAuditLog({
    actorUserId: req.admin?.id,
    action: 'team.update',
    resourceType: 'team_member',
    resourceId: id,
    req,
  })

  return res.json({ ok: true })
})

router.delete('/team/:id', requireAuth, requirePermission('team.write'), async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })

  await db('team_members').where({ id }).update({ is_published: false })

  await writeAuditLog({
    actorUserId: req.admin?.id,
    action: 'team.delete',
    resourceType: 'team_member',
    resourceId: id,
    req,
  })

  return res.status(204).send()
})

// Hard delete (super admin only)
router.delete(
  '/team/:id/hard',
  requireAuth,
  requirePermission('team.write'),
  async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })
    if (req.admin?.role !== 'super_admin') return res.status(403).json({ message: 'Forbidden' })

    const affected = await db('team_members').where({ id }).del()
    if (affected === 0) return res.status(404).json({ message: 'Team member not found' })

    await writeAuditLog({
      actorUserId: req.admin?.id,
      action: 'team.delete.hard',
      resourceType: 'team_member',
      resourceId: id,
      req,
    })

    return res.status(204).send()
  },
)

// Upload team photo (stores file in /uploads/team and returns a public URL)
router.post(
  '/team/photo-upload',
  requireAuth,
  requirePermission('team.write'),
  uploadTeamPhoto.single('photo'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No photo provided' })
    const fileUrl = `/uploads/team/${req.file.filename}`
    return res.status(201).json({ url: fileUrl })
  },
)

module.exports = router

