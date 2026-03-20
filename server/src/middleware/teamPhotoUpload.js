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

const MAX_FILE_SIZE_BYTES = 6 * 1024 * 1024 // 6MB

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      const dest = path.join(UPLOAD_ROOT, 'team')
      ensureDir(dest)
      return cb(null, dest)
    } catch (err) {
      return cb(err)
    }
  },
  filename: (_req, file, cb) => {
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
  if (Object.prototype.hasOwnProperty.call(allowedMimeToExt, file.mimetype)) return cb(null, true)
  return cb(new Error('Unsupported file type'))
}

const uploadTeamPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
})

module.exports = {
  uploadTeamPhoto,
  MAX_FILE_SIZE_BYTES,
}

