const express = require('express')

const db = require('../../src/db')
const { parsePossiblyJson } = require('../utils/json')

const router = express.Router()

router.get('/settings', async (_req, res) => {
  const rows = await db('site_settings').select('key', 'value')

  const result = {}
  for (const row of rows) {
    result[row.key] = parsePossiblyJson(row.value)
  }

  return res.json({
    site: result.site ?? null,
    about: result.about ?? null,
    nav: result.nav ?? null,
    quickStats: result.quickStats ?? null,
    solutions: result.solutions ?? null,
    services: result.services ?? null,
    projects: result.projects ?? [],
  })
})

module.exports = router

