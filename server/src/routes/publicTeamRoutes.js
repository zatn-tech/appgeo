const express = require('express')

const db = require('../../src/db')

const router = express.Router()

router.get('/team', async (_req, res) => {
  const members = await db('team_members')
    .select('id', 'name', 'role', 'education', 'bio', 'photo_url', 'photo_position', 'sort_order')
    .where({ is_published: true })
    .orderBy('sort_order', 'asc')

  return res.json({
    team: members.map((m) => ({
      name: m.name,
      role: m.role,
      education: m.education || '',
      bio: m.bio,
      photo: m.photo_url,
      photoPosition: m.photo_position,
    })),
  })
})

module.exports = router

