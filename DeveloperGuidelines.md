# Developer Guidelines (Mining System)

Last updated: 2026-03-20

## Purpose

This document defines the development conventions and security expectations for the Mining system:

- `server/`: Express + Knex API (public `/api/*` and protected `/api/admin/*`)
- `mining-website/`: React UI (public site + admin dashboard)

## Development workflow

### Local startup

1. Start the backend

```bash
cd server
npm install
npm run dev
```

2. Start the frontend

```bash
cd mining-website
npm install
npm run dev
```

3. Configure environment variables using `server/.env.example`.

## Code style conventions (server)

- Use `const` by default. Use `let` only when values are reassigned.
- Prefer `async/await` over callbacks for route logic.
- Validate request payloads with `zod` and return `400` on validation errors.
- Use Knex query builder for database interactions (avoid raw SQL unless absolutely necessary).
- Keep modules small: routes should orchestrate; put non-trivial logic into utilities/middleware.

### Request validation pattern

For any new endpoint that accepts input:

- Create a `zod` schema near the route.
- Use `schema.safeParse(req.body)` (or `req.query` where relevant).
- Return a generic message in production; avoid leaking internals.

## API design and RBAC requirements

### Protected routes

All admin endpoints must be protected with:

- `requireAuth` (JWT stored in an `httpOnly` cookie)
- `requirePermission('<permission.key>')` for authorization

### Permission keys

When adding new capabilities:

- Add/extend the permission keys via migrations/seeds.
- Apply `requirePermission` consistently on the new routes.

## Security: mandatory rules for new code

The system already includes several security controls. New functionality must not bypass them.

### Authentication & session handling

- Do not store or return admin secrets/tokens in API responses.
- New admin endpoints should rely on `req.admin` populated by `requireAuth`.
- Use the existing pattern of minimal JWT payloads and DB-backed permission checks per request.

### Rate limiting

Add a dedicated limiter when an endpoint is vulnerable to brute-force or upload abuse (login/OTP/reset/upload flows).

When in doubt:

- Add a limiter in `server/src/middleware/rateLimiters.js`
- Mount it on the specific route(s), not only on `/api`.

### File uploads

For any new upload feature:

- Use `multer` with:
  - strict MIME/type checks (`fileFilter`)
  - strict size limits (`limits.fileSize`)
  - server-generated filenames (random UUIDs)
  - no user-controlled filesystem paths
- Validate and constrain user-provided identifiers used for directory routing (for example, gallery `sectionSlug`):
  - accept only the expected character set
  - enforce a max length

### Media access control

Never rely on raw static URL access for sensitive/unpublished content.

If a resource must be hidden unless published or the requester is an admin, implement access checks in Express routes (like the existing `/uploads/team/:filename` handler).

### Auditing and logging

For sensitive actions (auth, user management, publishing/unpublishing, content changes):

- Call `writeAuditLog({ actorUserId, action, resourceType, resourceId, req })`.
- Do not log OTPs, password reset secrets, or JWT tokens.
- Use `logError` / the central error handler; do not leak stack traces to clients in production.

## Database changes

### Migrations and seeds

- Add migrations under `server/migrations/`.
- Update role/permission tables via migrations and seed scripts as needed.
- Seed changes should be reflected in `npm run seed -- --env development`.

### Knex patterns

- Use transactions (`db.transaction`) for multi-step writes that must remain consistent.
- Validate numeric query params (limit/order IDs) and clamp request-controlled values.

## Operational expectations

- Avoid crashing the API on non-critical failures (for example: audit logging or email delivery failures).
- Keep error responses generic in production; include details only in development.

## Updating the docs

When changing any of these behaviors, update:

- `DeveloperGuidelines.md` (if development/security conventions change)
- `docs/CX-Help-Doc.md` (if end-user or CX/support workflows change)

