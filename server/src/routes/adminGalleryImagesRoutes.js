const express = require('express')
const { z } = require('zod')

const db = require('../../src/db')
const { requireAuth, requirePermission } = require('../auth/middleware')
const { writeAuditLog } = require('../utils/audit')
const { invalidatePublicGalleryCache } = require('../utils/publicGalleryCache')

const router = express.Router()

const imageUpdateSchema = z.object({
  alt: z.string().max(255).optional(),
  sort_order: z.number().int().optional(),
  sectionSlug: z.string().min(1).max(120).optional(),
  is_published: z.boolean().optional(),
  is_home_slide: z.boolean().optional(),
  file_url: z.string().optional(), // advanced use
  thumb_url: z.string().nullable().optional(),
})

router.get('/gallery/images', requireAuth, requirePermission('gallery.read'), async (req, res) => {
  const sectionSlug = typeof req.query.sectionSlug === 'string' ? req.query.sectionSlug : null
  const sectionId = typeof req.query.sectionId === 'string' ? Number(req.query.sectionId) : null

  const query = db('gallery_images as gi')
    .join('gallery_sections as gs', 'gi.section_id', 'gs.id')
    .select(
      'gi.id',
      'gs.slug as sectionSlug',
      'gi.file_url',
      'gi.thumb_url',
      'gi.alt',
      'gi.sort_order',
      'gi.is_published',
      'gi.is_home_slide',
    )

  if (sectionSlug) {
    query.where('gs.slug', sectionSlug)
  } else if (sectionId && Number.isFinite(sectionId)) {
    query.where('gi.section_id', sectionId)
  }

  // Avoid ambiguous `sort_order` (both gallery_images + gallery_sections have it).
  const images = await query
    .orderBy('gs.slug', 'asc')
    .orderBy('gi.sort_order', 'asc')

  return res.json({ images })
})

router.put('/gallery/images/:id', requireAuth, requirePermission('gallery.write'), async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })

  const parsed = imageUpdateSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid gallery image payload' })

  const incoming = parsed.data
  const patch = {}
  if (incoming.alt !== undefined) patch.alt = incoming.alt
  if (incoming.sort_order !== undefined) patch.sort_order = incoming.sort_order
  if (incoming.file_url !== undefined) patch.file_url = incoming.file_url
  if (incoming.thumb_url !== undefined) patch.thumb_url = incoming.thumb_url
  if (incoming.is_published !== undefined) patch.is_published = incoming.is_published
  if (incoming.is_home_slide !== undefined) patch.is_home_slide = incoming.is_home_slide

  if (incoming.sectionSlug !== undefined) {
    const section = await db('gallery_sections').select('id').where({ slug: incoming.sectionSlug }).first()
    if (!section) return res.status(400).json({ message: 'Unknown sectionSlug' })
    patch.section_id = section.id
  }

  if (!Object.keys(patch).length) return res.status(400).json({ message: 'No fields to update' })

  await db('gallery_images').where({ id }).update(patch)

  await writeAuditLog({
    actorUserId: req.admin?.id,
    action: 'gallery.image.update',
    resourceType: 'gallery_image',
    resourceId: id,
    req,
  })

  invalidatePublicGalleryCache()
  return res.json({ ok: true })
})

router.delete('/gallery/images/:id', requireAuth, requirePermission('gallery.write'), async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' })

  await db('gallery_images').where({ id }).update({ is_published: false })

  await writeAuditLog({
    actorUserId: req.admin?.id,
    action: 'gallery.image.delete',
    resourceType: 'gallery_image',
    resourceId: id,
    req,
  })

  invalidatePublicGalleryCache()
  return res.status(204).send()
})

module.exports = router

