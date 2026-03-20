import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { AboutPage } from './pages/AboutPage.jsx'
import { ServicesPage } from './pages/ServicesPage.jsx'
import { SolutionsPage } from './pages/SolutionsPage.jsx'
import { TeamPage } from './pages/TeamPage.jsx'
import { GalleryPage } from './pages/GalleryPage.jsx'
import { CareersPage } from './pages/CareersPage.jsx'
import { ContactPage } from './pages/ContactPage.jsx'

import { RequirePermission } from './components/admin/RequirePermission.jsx'
import { ADMIN_PERMISSIONS } from './auth/adminPermissions.js'
import { AdminLoginPage } from './pages/admin/AdminLoginPage.jsx'
import { AdminNotAuthorizedPage } from './pages/admin/AdminNotAuthorizedPage.jsx'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.jsx'
import { AdminTeamPage } from './pages/admin/AdminTeamPage.jsx'
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage.jsx'
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx'
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage.jsx'
import { AdminContactSubmissionsPage } from './pages/admin/AdminContactSubmissionsPage.jsx'
import { AdminCareerApplicationsPage } from './pages/admin/AdminCareerApplicationsPage.jsx'
import { AdminCareerOpeningsPage } from './pages/admin/AdminCareerOpeningsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/not-authorized" element={<AdminNotAuthorizedPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequirePermission>
              {(user) => <AdminDashboardPage user={user} />}
            </RequirePermission>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RequirePermission permissions={[ADMIN_PERMISSIONS.SITE_SETTINGS_WRITE]}>
              {(user) => (user?.role === 'super_admin' ? <AdminSettingsPage /> : <Navigate to="/admin/not-authorized" replace />)}
            </RequirePermission>
          }
        />
        <Route
          path="/admin/team"
          element={
            <RequirePermission permissions={[ADMIN_PERMISSIONS.TEAM_WRITE]}>
              {(user) => <AdminTeamPage user={user} />}
            </RequirePermission>
          }
        />
        <Route
          path="/admin/gallery"
          element={
            <RequirePermission permissions={[ADMIN_PERMISSIONS.GALLERY_WRITE]}>
              {() => <AdminGalleryPage />}
            </RequirePermission>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequirePermission permissions={[ADMIN_PERMISSIONS.USERS_READ]}>
              {(user) => <AdminUsersPage user={user} />}
            </RequirePermission>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <RequirePermission permissions={[ADMIN_PERMISSIONS.USERS_READ]}>
              {(user) => <AdminAuditLogsPage user={user} />}
            </RequirePermission>
          }
        />
        <Route
          path="/admin/contact-submissions"
          element={
            <RequirePermission permissions={[ADMIN_PERMISSIONS.TEAM_READ]}>
              {(user) => <AdminContactSubmissionsPage user={user} />}
            </RequirePermission>
          }
        />
        <Route
          path="/admin/career-openings"
          element={
            <RequirePermission permissions={[ADMIN_PERMISSIONS.TEAM_WRITE]}>
              {() => <AdminCareerOpeningsPage />}
            </RequirePermission>
          }
        />
        <Route
          path="/admin/career-applications"
          element={
            <RequirePermission permissions={[ADMIN_PERMISSIONS.TEAM_READ]}>
              {(user) => <AdminCareerApplicationsPage user={user} />}
            </RequirePermission>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
