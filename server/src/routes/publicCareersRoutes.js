const express = require('express')
const { z } = require('zod')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const multer = require('multer')
const db = require('../../src/db')
const config = require('../config')

const router = express.Router()

const CAREERS_UPLOAD_DIR = path.join(config.UPLOAD_ROOT, 'resumes')
try {
  fs.mkdirSync(CAREERS_UPLOAD_DIR, { recursive: true })
} catch {
  // do not crash boot if directory creation fails now; multer write will fail with proper error
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, CAREERS_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.pdf'
    cb(null, `${crypto.randomUUID()}${ext}`)
  },
})

const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const name = String(file.originalname || '').toLowerCase()
    const mime = String(file.mimetype || '').toLowerCase()
    const isPdf = mime === 'application/pdf' || name.endsWith('.pdf')
    if (!isPdf) return cb(new Error('Only PDF resumes are allowed'))
    return cb(null, true)
  },
})

const careerSchema = z.object({
  openingId: z.number().int().positive(),
  fullName: z.string().min(1).max(160),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional().nullable(),
  appliedRole: z.string().max(160).optional().nullable(),
  education: z.string().max(5000).optional().nullable(),
  experience: z.string().max(5000).optional().nullable(),
  location: z.string().max(5000).optional().nullable(),
  message: z.string().max(5000).optional().nullable(),
  resumeUrl: z.string().max(512).optional().nullable(),
})

router.get('/careers/openings', async (_req, res) => {
  const openings = await db('career_openings')
    .select(
      'id',
      'title',
      'employment_type as employmentType',
      'location',
      'summary',
      'requirements',
      'sort_order as sortOrder',
    )
    .where({ is_published: true })
    .orderBy([{ column: 'sort_order', order: 'asc' }, { column: 'id', order: 'desc' }])

  return res.json({ openings })
})

router.post('/careers/resume-upload', (req, res) => {
  resumeUpload.single('resume')(req, res, (err) => {
    if (err) {
      const msg = err?.message || 'Resume upload failed'
      return res.status(400).json({ message: msg })
    }
    if (!req.file) return res.status(400).json({ message: 'Resume file is required' })
    return res.status(201).json({
      ok: true,
      resumeUrl: `/uploads/resumes/${req.file.filename}`,
    })
  })
})

router.post('/careers/apply', async (req, res) => {
  const parsed = careerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid career application payload' })

  const payload = parsed.data
  const opening = await db('career_openings').select('id', 'title').where({ id: payload.openingId }).first()
  if (!opening) return res.status(400).json({ message: 'Please select a valid opening' })

  await db('career_applications').insert({
    opening_id: opening.id,
    full_name: payload.fullName,
    email: payload.email,
    phone: payload.phone ?? null,
    applied_role: payload.appliedRole || opening.title,
    education: payload.education ?? null,
    experience: payload.experience ?? null,
    location: payload.location ?? null,
    message: payload.message ?? null,
    resume_url: payload.resumeUrl ?? null,
  })

  return res.status(201).json({ ok: true })
})

module.exports = router

