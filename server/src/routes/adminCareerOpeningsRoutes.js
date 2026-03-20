const express = require('express')
const { z } = require('zod')

const db = require('../db')
const { requireAuth, requirePermission } = require('../auth/middleware')

const router = express.Router()

const openingSchema = z.object({
  title: z.string().min(1).max(160),
  employmentType: z.string().max(80).optional().default('Full-time'),
  location: z.string().max(160).optional().nullable(),
  summary: z.string().max(5000).optional().nullable(),
  requirements: z.string().max(10000).optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
  isPublished: z.boolean().optional().default(true),
})

router.get('/career-openings', requireAuth, requirePermission('team.read'), async (_req, res) => {
  const openings = await db('career_openings')
    .select(
      'id',
      'title',
      'employment_type as employmentType',
      'location',
      'summary',
      'requirements',
      'sort_order as sortOrder',
      'is_published as isPublished',
      'created_at as createdAt',
      'updated_at as updatedAt',
    )
    .orderBy([{ column: 'sort_order', order: 'asc' }, { column: 'id', order: 'desc' }])

  return res.json({ openings })
})

router.post('/career-openings', requireAuth, requirePermission('team.write'), async (req, res) => {
  const parsed = openingSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid opening payload' })
  const p = parsed.data
  const [id] = await db('career_openings').insert({
    title: p.title,
    employment_type: p.employmentType,
    location: p.location ?? null,
    summary: p.summary ?? null,
    requirements: p.requirements ?? null,
    sort_order: p.sortOrder,
    is_published: p.isPublished,
  })
  return res.status(201).json({ id })
})

router.put('/career-openings/:id', requireAuth, requirePermission('team.write'), async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })
  const parsed = openingSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid opening payload' })
  const p = parsed.data
  const patch = { updated_at: db.fn.now() }
  if (p.title !== undefined) patch.title = p.title
  if (p.employmentType !== undefined) patch.employment_type = p.employmentType
  if (p.location !== undefined) patch.location = p.location
  if (p.summary !== undefined) patch.summary = p.summary
  if (p.requirements !== undefined) patch.requirements = p.requirements
  if (p.sortOrder !== undefined) patch.sort_order = p.sortOrder
  if (p.isPublished !== undefined) patch.is_published = p.isPublished
  await db('career_openings').where({ id }).update(patch)
  return res.json({ ok: true })
})

router.delete('/career-openings/:id', requireAuth, requirePermission('team.write'), async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })
  await db('career_openings').where({ id }).update({ is_published: false, updated_at: db.fn.now() })
  return res.status(204).send()
})

module.exports = router

