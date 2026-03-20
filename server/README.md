# Mining Server (Namecheap full-stack backend)

This backend provides the `/api/*` endpoints for the React frontend and the protected `/api/admin/*` endpoints for the admin dashboard.

## Database migrations (RBAC + content)

Run migrations:

```bash
cd server
npm run migrate -- --env development
```

Seed roles/permissions:

```bash
cd server
npm run seed -- --env development
```

## Config (env vars)

The server uses `dotenv` (see `.env` / `.env.example`).

For MySQL/MariaDB, set:

- `DB_HOST`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
For local development you will need a reachable MySQL/MariaDB instance.

## Common commands

Start server:

```bash
cd server
npm run dev
```

