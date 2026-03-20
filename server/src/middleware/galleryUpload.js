const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const { UPLOAD_ROOT } = require('../config')

const allowedMimeToExt = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024 // 8MB

function assertSafeSectionSlug(sectionSlug) {
  // Keep destination path isolated; only allow expected slugs.
  return /^[a-z0-9-]{1,80}$/.test(sectionSlug)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const sectionSlug = String(req.body?.sectionSlug || 'general')
      if (!assertSafeSectionSlug(sectionSlug)) {
        return cb(new Error('Invalid sectionSlug'))
      }

      const dest = path.join(UPLOAD_ROOT, 'gallery', sectionSlug)
      fs.mkdirSync(dest, { recursive: true })
      return cb(null, dest)
    } catch (err) {
      return cb(err)
    }
  },
  filename: (req, file, cb) => {
    try {
      const ext = allowedMimeToExt[file.mimetype]
      if (!ext) return cb(new Error('Unsupported file type'))

      const filename = `${crypto.randomUUID()}${ext}`
      return cb(null, filename)
    } catch (err) {
      return cb(err)
    }
  },
})

const fileFilter = (_req, file, cb) => {
  if (Object.prototype.hasOwnProperty.call(allowedMimeToExt, file.mimetype)) {
    return cb(null, true)
  }
  return cb(new Error('Unsupported file type'))
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
})

module.exports = {
  upload,
  assertSafeSectionSlug,
  MAX_FILE_SIZE_BYTES,
}

