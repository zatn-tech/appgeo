const path = require('path')
const { pathToFileURL } = require('url')

const db = require('../src/db')

async function importEsm(modulePath) {
  const url = pathToFileURL(modulePath).href
  return import(url)
}

exports.seed = async function seed(knex) {
  const serverDb = knex

  const siteDataPath = path.join(__dirname, '../../mining-website/src/content/siteData.js')
  const galleryDataPath = path.join(__dirname, '../../mining-website/src/content/galleryData.js')

  const siteMod = await importEsm(siteDataPath)
  const galleryMod = await importEsm(galleryDataPath)

  const site = siteMod.site
  const nav = siteMod.nav
  const quickStats = siteMod.quickStats
  const solutions = siteMod.solutions
  const services = siteMod.services
  const projects = siteMod.projects
  const about = siteMod.about
  const gallerySections = galleryMod.gallerySections

  await serverDb('site_settings').del()
  await serverDb('team_members').del()
  await serverDb('gallery_images').del()
  await serverDb('gallery_sections').del()

  const settingsKeys = [
    ['site', site],
    ['about', about],
    ['nav', nav],
    ['quickStats', quickStats],
    ['solutions', solutions],
    ['services', services],
    ['projects', projects],
  ]

  for (const [key, value] of settingsKeys) {
    await serverDb('site_settings').insert({ key, value: JSON.stringify(value) })
  }

  // Team
  for (let i = 0; i < siteMod.team.length; i++) {
    const m = siteMod.team[i]
    await serverDb('team_members').insert({
      name: m.name,
      role: m.role,
      education: m.education || '',
      bio: m.bio,
      photo_url: m.photo,
      photo_position: m.photoPosition || '',
      sort_order: i,
      is_published: true,
    })
  }

  // Gallery sections + images
  for (let s = 0; s < gallerySections.length; s++) {
    const section = gallerySections[s]
    const [sectionId] = await serverDb('gallery_sections').insert({
      name: section.title,
      slug: section.slug,
      sort_order: s,
      is_published: true,
    })

    for (let i = 0; i < section.images.length; i++) {
      const img = section.images[i]
      await serverDb('gallery_images').insert({
        section_id: sectionId,
        file_url: img.src,
        thumb_url: null,
        alt: img.alt,
        sort_order: i,
        is_published: true,
      })
    }
  }
}

