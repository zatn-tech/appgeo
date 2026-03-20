const express = require('express')
const { z } = require('zod')

const db = require('../../src/db')
const { requireAuth, requirePermission } = require('../auth/middleware')
const { writeAuditLog } = require('../utils/audit')
const { invalidatePublicGalleryCache } = require('../utils/publicGalleryCache')

const router = express.Router()

const sectionSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  sort_order: z.number().int().optional().default(0),
  is_published: z.boolean().optional().default(true),
})

router.get('/gallery/sections', requireAuth, requirePermission('gallery.read'), async (_req, res) => {
  const sections = await db('gallery_sections')
    .select('id', 'name', 'slug', 'sort_order', 'is_published')
    .orderBy('sort_order', 'asc')

  return res.json({ sections })
})

router.post('/gallery/sections', requireAuth, requirePermission('gallery.write'), async (req, res) => {
  const parsed = sectionSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid gallery section payload' })

  const payload = parsed.data

  const [id] = await db('gallery_sections').insert({
    name: payload.name,
    slug: payload.slug,
    sort_order: payload.sort_order,
    is_published: payload.is_published,
  })

  await writeAuditLog({
    actorUserId: req.admin?.id,
    action: 'gallery.section.create',
    resourceType: 'gallery_section',
    resourceId: id,
    req,
  })

  invalidatePublicGalleryCache()
  return res.status(201).json({ id })
})

router.put('/gallery/sections/:id', requireAuth, requirePermission('gallery.write'), async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })

  const parsed = sectionSchema
    .partial()
    .extend({
      name: sectionSchema.shape.name.optional(),
      slug: sectionSchema.shape.slug.optional(),
    })
    .safeParse(req.body)

  if (!parsed.success) return res.status(400).json({ message: 'Invalid gallery section payload' })

  await db('gallery_sections')
    .where({ id })
    .update({
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.slug !== undefined ? { slug: parsed.data.slug } : {}),
      ...(parsed.data.sort_order !== undefined ? { sort_order: parsed.data.sort_order } : {}),
      ...(parsed.data.is_published !== undefined ? { is_published: parsed.data.is_published } : {}),
    })

  await writeAuditLog({
    actorUserId: req.admin?.id,
    action: 'gallery.section.update',
    resourceType: 'gallery_section',
    resourceId: id,
    req,
  })

  invalidatePublicGalleryCache()
  return res.json({ ok: true })
})

router.delete('/gallery/sections/:id', requireAuth, requirePermission('gallery.write'), async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })

  await db('gallery_sections').where({ id }).update({ is_published: false })
  await db('gallery_images').where({ section_id: id }).update({ is_published: false })

  await writeAuditLog({
    actorUserId: req.admin?.id,
    action: 'gallery.section.delete',
    resourceType: 'gallery_section',
    resourceId: id,
    req,
  })

  invalidatePublicGalleryCache()
  return res.status(204).send()
})

module.exports = router

