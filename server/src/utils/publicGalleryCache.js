const DEFAULT_TTL_MS = Number(process.env.PUBLIC_GALLERY_CACHE_TTL_MS || 60_000)

const KEYS = {
  gallery: 'public-gallery',
  homeSlides: 'public-home-slides',
}

// key -> { value, expiresAt }
const store = new Map()
// key -> Promise<any>
const inFlight = new Map()

function nowMs() {
  return Date.now()
}

function getValidEntry(key) {
  const entry = store.get(key)
  if (!entry) return null
  if (entry.expiresAt <= nowMs()) {
    store.delete(key)
    return null
  }
  return entry
}

async function getOrSet(key, fetchFn, ttlMs = DEFAULT_TTL_MS) {
  const existing = getValidEntry(key)
  if (existing) return existing.value

  const existingPromise = inFlight.get(key)
  if (existingPromise) return existingPromise

  const promise = Promise.resolve()
    .then(fetchFn)
    .then((value) => {
      store.set(key, { value, expiresAt: nowMs() + ttlMs })
      return value
    })
    .finally(() => {
      inFlight.delete(key)
    })

  inFlight.set(key, promise)
  return promise
}

function invalidatePublicGalleryCache() {
  store.delete(KEYS.gallery)
  store.delete(KEYS.homeSlides)
}

async function getCachedGallery(fetchFn) {
  return getOrSet(KEYS.gallery, fetchFn)
}

async function getCachedHomeSlides(fetchFn) {
  return getOrSet(KEYS.homeSlides, fetchFn)
}

module.exports = {
  DEFAULT_TTL_MS,
  getCachedGallery,
  getCachedHomeSlides,
  invalidatePublicGalleryCache,
}

