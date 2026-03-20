const fs = require('fs')
const path = require('path')

const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '..', '..', 'logs')
const LOG_FILE = process.env.LOG_FILE || path.join(LOG_DIR, 'server.log')

function ensureLogDir() {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  } catch {
    // If we can't write logs, we still don’t want to crash the API.
  }
}

function appendLine(line) {
  ensureLogDir()
  try {
    fs.appendFileSync(LOG_FILE, `${line}\n`, { encoding: 'utf8' })
  } catch {
    // Swallow logging failures.
  }
}

function log({ level = 'info', message, meta }) {
  const record = {
    ts: new Date().toISOString(),
    level,
    message,
    meta: meta ?? undefined,
  }
  appendLine(JSON.stringify(record))
}

function logError(err, meta) {
  log({
    level: 'error',
    message: err?.message || String(err),
    meta: meta ?? {
      name: err?.name,
      stack: err?.stack,
    },
  })
}

module.exports = { log, logError }

