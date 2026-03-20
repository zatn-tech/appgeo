const express = require('express')

const db = require('../../src/db')
const {
  DEFAULT_TTL_MS,
  getCachedGallery,
  getCachedHomeSlides,
} = require('../utils/publicGalleryCache')

const router = express.Router()

router.get('/gallery', async (_req, res) => {
  const maxAgeSeconds = Math.max(0, Math.floor(DEFAULT_TTL_MS / 1000))
  res.set('Cache-Control', `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}`)

  const gallery = await getCachedGallery(async () => {
    const sections = await db('gallery_sections')
      .select('id', 'name', 'slug', 'sort_order')
      .where({ is_published: true })
      .orderBy('sort_order', 'asc')

    if (!sections.length) return []

    const sectionIds = sections.map((s) => s.id)
    const images = await db('gallery_images')
      .select('id', 'section_id', 'file_url', 'thumb_url', 'alt', 'sort_order')
      .whereIn('section_id', sectionIds)
      .andWhere({ is_published: true })
      .orderBy(['section_id', 'sort_order'])

    const imagesBySectionId = new Map()
    for (const img of images) {
      if (!imagesBySectionId.has(img.section_id)) imagesBySectionId.set(img.section_id, [])
      imagesBySectionId.get(img.section_id).push(img)
    }

    return sections.map((s) => ({
      title: s.name,
      slug: s.slug,
      images: (imagesBySectionId.get(s.id) || []).map((img) => ({
        src: img.file_url,
        alt: img.alt,
      })),
    }))
  })

  return res.json({ gallery })
})

router.get('/gallery/home-slides', async (_req, res) => {
  const maxAgeSeconds = Math.max(0, Math.floor(DEFAULT_TTL_MS / 1000))
  res.set('Cache-Control', `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}`)

  const slides = await getCachedHomeSlides(async () => {
    const rows = await db('gallery_images')
      .select('id', 'file_url', 'alt', 'sort_order')
      .where({ is_published: true, is_home_slide: true })
      .orderBy('sort_order', 'asc')
      .limit(12)

    return rows.map((r) => ({
      src: r.file_url,
      alt: r.alt || 'Gallery slide',
    }))
  })

  return res.json({ slides })
})

module.exports = router

