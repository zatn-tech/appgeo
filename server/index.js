require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const path = require('path')

const config = require('./src/config')
const apiRoutes = require('./src/routes')
const { apiLimiter } = require('./src/middleware/rateLimiters')
const { logError } = require('./src/utils/logger')
const db = require('./src/db')
const { COOKIE_NAME } = config
const { verifyAdminToken } = require('./src/auth/session')

const app = express()

// If you sit behind a proxy/load balancer in production, trust it so `secure` cookies work.
app.set('trust proxy', 1)

app.disable('x-powered-by')
app.use(helmet())
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin and non-browser requests.
      if (!origin) return cb(null, true)
      const allowed = process.env.CORS_ORIGIN || 'http://localhost:5173'
      if (origin === allowed) return cb(null, true)
      return cb(null, false)
    },
    credentials: true,
  }),
)

app.use('/api', apiLimiter)
app.use('/api', apiRoutes)

// Protect team photos without changing storage.
// - Public users only get images for `team_members.is_published = true`
// - Admins (logged in) can see images even if unpublished
// This prevents "unpublish" from still being accessible via direct `/uploads/team/<filename>` URLs.
app.get('/uploads/team/:filename', async (req, res) => {
  try {
    const rawFilename = String(req.params.filename || '')
    const filename = path.basename(rawFilename)
    const ext = path.extname(filename).toLowerCase()
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return res.status(404).send('Not found')

    const fileUrl = `/uploads/team/${filename}`
    const member = await db('team_members')
      .select('is_published')
      .where({ photo_url: fileUrl })
      .first()

    if (!member) return res.status(404).send('Not found')

    // Optional admin access
    let isAdmin = false
    const token = req.cookies?.[COOKIE_NAME]
    if (token) {
      try {
        const payload = verifyAdminToken(token)
        const userId = payload?.sub
        if (userId) {
          const u = await db('users').select('id').where({ id: userId, is_active: true }).first()
          isAdmin = Boolean(u)
        }
      } catch {
        isAdmin = false
      }
    }

    if (!member.is_published && !isAdmin) return res.status(404).send('Not found')

    const filePath = path.join(config.UPLOAD_ROOT, 'team', filename)
    if (!fs.existsSync(filePath)) return res.status(404).send('Not found')
    return res.sendFile(filePath)
  } catch (err) {
    logError(err, { path: req?.path, method: req?.method })
    return res.status(404).send('Not found')
  }
})

// Serve uploaded media (used by the gallery upload route).
app.use('/uploads', express.static(config.UPLOAD_ROOT))

// Basic error handler (don’t leak internals).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  logError(err, { path: req?.path, method: req?.method })
  if (err?.message && ['Invalid sectionSlug', 'Unsupported file type'].includes(err.message)) {
    return res.status(400).json({ message: err.message })
  }

  if (config.NODE_ENV !== 'production') {
    return res.status(500).json({ message: err?.message || 'Internal server error' })
  }

  return res.status(500).json({ message: 'Internal server error' })
})

app.listen(config.PORT, () => {
  console.log(`Mining server listening on port ${config.PORT}`)
})

