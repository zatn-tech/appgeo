const express = require('express')

const db = require('../db')
const { requireAuth, requirePermission } = require('../auth/middleware')
const { upload } = require('../middleware/galleryUpload')
const { uploadLimiter } = require('../middleware/rateLimiters')
const { writeAuditLog } = require('../utils/audit')
const { invalidatePublicGalleryCache } = require('../utils/publicGalleryCache')

const router = express.Router()

router.post(
  '/gallery/images/upload',
  uploadLimiter,
  requireAuth,
  requirePermission('gallery.images.upload'),
  upload.single('image'),
  async (req, res) => {
    try {
      const sectionSlug = String(req.body?.sectionSlug || 'general')
      if (!/^[a-z0-9-]{1,80}$/.test(sectionSlug)) {
        return res.status(400).json({ message: 'Invalid sectionSlug' })
      }

      if (!req.file) return res.status(400).json({ message: 'No image provided' })

      let section = await db('gallery_sections').select('id').where({ slug: sectionSlug }).first()
      if (!section) {
        const [id] = await db('gallery_sections').insert({
          name: 'General',
          slug: sectionSlug,
          sort_order: 0,
          is_published: true,
        })
        section = { id }
      }

      const alt = String(req.body?.alt || req.file.filename).slice(0, 255)

      // This is the public URL that the frontend will render from.
      const fileUrl = `/uploads/gallery/${sectionSlug}/${req.file.filename}`

      const [id] = await db('gallery_images').insert({
        section_id: section.id,
        file_url: fileUrl,
        alt,
        sort_order: 0,
        is_published: true,
      })

      await writeAuditLog({
        actorUserId: req.admin?.id,
        action: 'gallery.image.create',
        resourceType: 'gallery_image',
        resourceId: id,
        req,
      })

      invalidatePublicGalleryCache()
      return res.status(201).json({ id })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Upload failed' })
    }
  },
)

module.exports = router

