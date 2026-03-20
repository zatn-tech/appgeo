async function requestJson(url, { method = 'GET', body, credentials = 'include' } = {}) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials,
  })

  const text = await res.text()
  const json = text ? JSON.parse(text) : null

  if (!res.ok) {
    const message = json?.message || `Request failed: ${res.status}`
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return json
}

async function requestMultipart(url, { method = 'POST', formData, credentials = 'include' } = {}) {
  const res = await fetch(url, {
    method,
    body: formData,
    credentials,
  })

  const text = await res.text()
  const json = text ? JSON.parse(text) : null

  if (!res.ok) {
    const message = json?.message || `Request failed: ${res.status}`
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return json
}

export const apiClient = {
  getAdminMe: () => requestJson('/api/admin/me'),

  loginAdmin: ({ email, password }) =>
    requestJson('/api/admin/login', {
      method: 'POST',
      body: { email, password },
    }),

  logoutAdmin: () =>
    requestJson('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    }),

  // Users / RBAC
  getAdminUsers: () => requestJson('/api/admin/users'),
  createAdminUser: (payload) =>
    requestJson('/api/admin/users', {
      method: 'POST',
      body: payload,
    }),
  updateAdminUser: (id, payload) =>
    requestJson(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  requestUserVerificationOtp: ({ email }) =>
    requestJson('/api/admin/users/verification/request', {
      method: 'POST',
      body: { email },
    }),
  confirmUserVerificationOtp: ({ email, otp, newPassword }) =>
    requestJson('/api/admin/users/verification/confirm', {
      method: 'POST',
      body: { email, otp, ...(newPassword ? { newPassword } : {}) },
    }),
  requestPasswordReset: ({ email }) =>
    requestJson('/api/admin/users/password-reset/request', {
      method: 'POST',
      body: { email },
    }),
  confirmPasswordReset: ({ email, otp, newPassword }) =>
    requestJson('/api/admin/users/password-reset/confirm', {
      method: 'POST',
      body: { email, otp, newPassword },
    }),

  deleteAdminUser: (id) =>
    requestJson(`/api/admin/users/${id}`, {
      method: 'DELETE',
    }),

  getAdminAuditLogs: ({ limit = 30, cursor } = {}) => {
    let url = `/api/admin/audit-logs?limit=${encodeURIComponent(limit)}`
    if (cursor !== undefined && cursor !== null) {
      url += `&cursor=${encodeURIComponent(cursor)}`
    }
    return requestJson(url)
  },

  getSettings: () => requestJson('/api/settings'),
  getTeam: () => requestJson('/api/team'),
  getGallery: () => requestJson('/api/gallery'),
  getHomeSlides: () => requestJson('/api/gallery/home-slides'),
  getCareerOpenings: () => requestJson('/api/careers/openings'),

  // Public forms
  submitContact: ({ name, phone, need }) =>
    requestJson('/api/contact', {
      method: 'POST',
      body: { name, phone, need },
    }),
  submitCareerApplication: ({
    openingId,
    fullName,
    email,
    phone,
    appliedRole,
    education,
    experience,
    location,
    message,
    resumeUrl,
  }) =>
    requestJson('/api/careers/apply', {
      method: 'POST',
      body: {
        openingId,
        fullName,
        email,
        phone,
        appliedRole,
        education,
        experience,
        location,
        message,
        resumeUrl,
      },
    }),
  uploadCareerResume: ({ file }) => {
    const formData = new FormData()
    formData.set('resume', file)
    return requestMultipart('/api/careers/resume-upload', { formData })
  },

  getAdminSettings: () => requestJson('/api/admin/settings'),
  updateAdminSettings: (payload) =>
    requestJson('/api/admin/settings', {
      method: 'PUT',
      body: payload,
    }),

  getAdminTeam: () => requestJson('/api/admin/team'),
  createAdminTeam: (payload) =>
    requestJson('/api/admin/team', {
      method: 'POST',
      body: payload,
    }),
  updateAdminTeam: (id, payload) =>
    requestJson(`/api/admin/team/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  deleteAdminTeam: (id) =>
    requestJson(`/api/admin/team/${id}`, {
      method: 'DELETE',
    }),

  deleteAdminTeamHard: (id) =>
    requestJson(`/api/admin/team/${id}/hard`, {
      method: 'DELETE',
    }),

  uploadAdminTeamPhoto: ({ file }) => {
    const formData = new FormData()
    formData.set('photo', file)
    return requestMultipart('/api/admin/team/photo-upload', { formData })
  },

  getAdminGallerySections: () => requestJson('/api/admin/gallery/sections'),
  createAdminGallerySection: (payload) =>
    requestJson('/api/admin/gallery/sections', {
      method: 'POST',
      body: payload,
    }),
  updateAdminGallerySection: (id, payload) =>
    requestJson(`/api/admin/gallery/sections/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  deleteAdminGallerySection: (id) =>
    requestJson(`/api/admin/gallery/sections/${id}`, {
      method: 'DELETE',
    }),

  getAdminGalleryImages: ({ sectionSlug } = {}) =>
    requestJson(
      `/api/admin/gallery/images${sectionSlug ? `?sectionSlug=${encodeURIComponent(sectionSlug)}` : ''}`,
    ),
  uploadGalleryImage: ({ sectionSlug, alt, file }) => {
    const formData = new FormData()
    if (sectionSlug) formData.set('sectionSlug', sectionSlug)
    if (alt) formData.set('alt', alt)
    formData.set('image', file)
    return requestMultipart('/api/admin/gallery/images/upload', { formData })
  },
  updateAdminGalleryImage: (id, payload) =>
    requestJson(`/api/admin/gallery/images/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  deleteAdminGalleryImage: (id) =>
    requestJson(`/api/admin/gallery/images/${id}`, {
      method: 'DELETE',
    }),

  // Contact/Careers submissions (admin)
  getAdminContactSubmissions: ({ limit = 100 } = {}) =>
    requestJson(`/api/admin/contact-submissions?limit=${encodeURIComponent(limit)}`),
  getAdminCareerApplications: ({ limit = 100, openingId } = {}) => {
    let url = `/api/admin/career-applications?limit=${encodeURIComponent(limit)}`
    if (openingId !== undefined && openingId !== null) url += `&openingId=${encodeURIComponent(openingId)}`
    return requestJson(url)
  },
  getAdminCareerOpenings: () => requestJson('/api/admin/career-openings'),
  createAdminCareerOpening: (payload) =>
    requestJson('/api/admin/career-openings', {
      method: 'POST',
      body: payload,
    }),
  updateAdminCareerOpening: (id, payload) =>
    requestJson(`/api/admin/career-openings/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  deleteAdminCareerOpening: (id) =>
    requestJson(`/api/admin/career-openings/${id}`, {
      method: 'DELETE',
    }),
}

