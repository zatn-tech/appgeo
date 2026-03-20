const express = require('express')
const { z } = require('zod')
const db = require('../../src/db')

const router = express.Router()

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().max(50).optional().nullable(),
  need: z.string().min(1).max(5000),
})

router.post('/contact', async (req, res) => {
  const parsed = contactSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid contact payload' })

  const payload = parsed.data

  await db('contact_us_submissions').insert({
    name: payload.name,
    phone: payload.phone ?? null,
    need: payload.need,
  })

  return res.status(201).json({ ok: true })
})

module.exports = router

