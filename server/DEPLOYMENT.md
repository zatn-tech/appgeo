# cPanel Deployment Hardening (Node + MySQL + Admin APIs)

This checklist applies to the backend deployed via Namecheap cPanel “Setup Node.js App”.

## 1) HTTPS-first setup
- Ensure the site domain has HTTPS enabled in cPanel.
- Make sure the Node app runs behind HTTPS (so `COOKIE_SECURE`/`secure` cookies work).
- In the Node app, keep:
  - `app.set('trust proxy', 1)` enabled (already in `server/index.js`)
  - `NODE_ENV=production` set (so cookie `secure: true` is used).

## 2) Environment secrets
Set environment variables in the cPanel Node app configuration:
- `NODE_ENV=production`
- `PORT` (or keep default from your cPanel mapping)
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `JWT_SECRET` (unique, long random string)
- `COOKIE_NAME` (optional)
- `UPLOAD_ROOT` (should point to your on-disk uploads folder, e.g. `public_html/uploads`)

Do NOT store secrets in repo code or commit them into Git.

## 3) Map URLs correctly
Configure cPanel reverse mapping so the same domain serves:
- `/api/*` -> Node app
- `/uploads/*` -> static files served by the web server (Apache)

This keeps cookie auth same-origin (simpler + safer than cross-origin cookies).

## 4) WAF / DDoS protection
- Enable a WAF at the edge (recommended):
  - Cloudflare WAF and/or rules to block obvious attack patterns
- Keep the backend rate limiters enabled:
  - global `/api/*` limiter
  - stricter limiter for `/api/admin/login`

## 5) Upload hardening at the web server
Uploads are stored on disk; ensure the server does not execute uploaded files:
- Disable executing scripts in the uploads directory (no PHP/CGI handling under `/uploads`).
- Ensure correct file permissions so only the app user can write.

The backend already enforces:
- allowed MIME types only
- UUID-based filenames
- isolated destination by `sectionSlug`

## 6) Backups and restore testing
Enable automatic backups for:
- MySQL/MariaDB database
- uploaded media directory (at least `/uploads/`)

Recommended: do one restore test before go-live to confirm backups are usable.

## 7) Post-deploy verification checklist
- `POST /api/admin/login` sets an `httpOnly` cookie successfully.
- Admin pages load only when logged in.
- Unauthenticated requests to `/api/admin/me` return `401`.
- Permission-restricted endpoints return `403`.
- Invalid uploads are rejected with `400` (unsupported MIME / invalid sectionSlug).

