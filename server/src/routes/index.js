const express = require('express')

const adminAuthRoutes = require('./adminAuthRoutes')
const adminGalleryRoutes = require('./adminGalleryRoutes')
const publicSettingsRoutes = require('./publicSettingsRoutes')
const publicTeamRoutes = require('./publicTeamRoutes')
const publicGalleryRoutes = require('./publicGalleryRoutes')
const adminSettingsRoutes = require('./adminSettingsRoutes')
const adminTeamRoutes = require('./adminTeamRoutes')
const adminGallerySectionsRoutes = require('./adminGallerySectionsRoutes')
const adminGalleryImagesRoutes = require('./adminGalleryImagesRoutes')
const adminUsersRoutes = require('./adminUsersRoutes')
const adminAuditLogsRoutes = require('./adminAuditLogsRoutes')
const publicContactRoutes = require('./publicContactRoutes')
const publicCareersRoutes = require('./publicCareersRoutes')
const adminContactSubmissionsRoutes = require('./adminContactSubmissionsRoutes')
const adminCareerApplicationsRoutes = require('./adminCareerApplicationsRoutes')
const adminCareerOpeningsRoutes = require('./adminCareerOpeningsRoutes')

const router = express.Router()

router.get('/healthz', (_req, res) => {
  res.json({ ok: true })
})

router.use(publicSettingsRoutes)
router.use(publicContactRoutes)
router.use(publicCareersRoutes)
router.use(publicTeamRoutes)
router.use(publicGalleryRoutes)

router.use('/admin', adminAuthRoutes)
router.use('/admin', adminGalleryRoutes)
router.use('/admin', adminSettingsRoutes)
router.use('/admin', adminTeamRoutes)
router.use('/admin', adminGallerySectionsRoutes)
router.use('/admin', adminGalleryImagesRoutes)
router.use('/admin', adminUsersRoutes)
router.use('/admin', adminAuditLogsRoutes)
router.use('/admin', adminContactSubmissionsRoutes)
router.use('/admin', adminCareerApplicationsRoutes)
router.use('/admin', adminCareerOpeningsRoutes)

module.exports = router

