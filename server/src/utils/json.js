function parsePossiblyJson(value) {
  if (value == null) return null
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    return JSON.parse(trimmed)
  } catch {
    return value
  }
}

function safeStringify(value) {
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

module.exports = { parsePossiblyJson, safeStringify }

