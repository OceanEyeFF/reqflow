# Cloud Readiness Boundary

This document records ReqFlow's pre-cloud deployment boundary. It is a decision baseline, not a deployment runbook.

## Current Position

- GitHub is the primary remote for CI/CD work.
- GitHub Actions CI exists and validates `npm ci`, `npm run lint`, `npm run test`, and `npm run build`.
- The application is still optimized for local/internal use with Prisma 5 and SQLite.
- MS5 does not migrate PostgreSQL, add pgvector, implement AI features, choose a paid hosting service, or create production secrets.

## Environment Variables

Production-like environments must provide environment variables through the hosting platform or secret manager. Do not commit real `.env` files or production values.

Required variables:

| Variable | Purpose | Boundary |
|----------|---------|----------|
| `AUTH_SECRET` | NextAuth signing/encryption secret | Must be a strong generated secret per environment. Do not reuse the CI placeholder or development examples. |
| `DATABASE_URL` | Prisma database connection string | Local/dev may use SQLite. Production needs an explicit database decision before launch. |

Optional future variables should be documented before use. Public browser-exposed variables must use the `NEXT_PUBLIC_` prefix and must not contain secrets.

## Authentication Secret

`AUTH_SECRET` is required for stable NextAuth session behavior outside local throwaway development. Treat it as a secret:

- Generate a unique value per deployed environment.
- Store it only in the hosting platform secret store or equivalent operator-controlled secret manager.
- Rotate it deliberately because active sessions may be invalidated.
- Never commit the value to Git, screenshots, tickets, or documentation.

## Database Boundary

ReqFlow currently uses Prisma with SQLite:

- Local development database: `DATABASE_URL="file:./dev.db"` resolves to `prisma/dev.db`.
- CI build database: `DATABASE_URL="file:./ci.db"` resolves to `prisma/ci.db`.
- Test databases are isolated under `prisma/test-dbs/`.

SQLite is acceptable for local development, demos, and a very small single-instance evaluation. It is not the long-term production concurrency baseline. Before production launch, decide one of these paths:

| Path | Allowed Now | Notes |
|------|-------------|-------|
| Keep SQLite for a temporary single-instance evaluation | Yes, with explicit risk acceptance | Requires persistent disk, backup plan, and low write concurrency expectations. |
| Migrate to PostgreSQL | Deferred | Requires a future worktrack for schema, migration, connection pooling, backups, and deployment config. |
| Add pgvector or vector search | Out of MS5 | This belongs to a later AI architecture decision, not the current cloud boundary. |

Do not treat a successful SQLite deployment as proof that production database risk is solved.

## Upload Storage Boundary

Attachments are currently written under `public/uploads/` on the application filesystem.

Before cloud deployment, confirm the hosting model:

- If the platform filesystem is ephemeral, local uploads can disappear across restarts or deploys.
- If the app runs multiple instances, local uploads can be split across instances.
- A durable object storage or mounted persistent volume decision is required before real production use.

MS5 does not choose an object storage provider or implement upload adapter changes. It only records that this decision is required.

## Deployment Platform Boundary

A deployment platform must support:

- Node.js runtime compatible with this repository's Next.js and Vite/Vitest toolchain.
- `npm ci` using `package-lock.json`.
- `npm run build` and `npm run start`.
- Environment variable and secret management for `AUTH_SECRET` and `DATABASE_URL`.
- Persistent database/storage plan matching the database and upload decisions.
- Build logs and deployment logs accessible to operators.

This document does not choose Vercel, Railway, Render, Fly.io, Docker, or any other provider. Selecting a provider requires a separate decision with cost, data, secret, storage, and rollback implications.

## Release And CI Boundary

GitHub Actions is the current quality gate. A deploy workflow should not bypass it.

Minimum pre-deploy signal:

- CI workflow on `develop` passes.
- Required environment variables are configured outside Git.
- Database and upload persistence risks are accepted or solved.
- Rollback path is documented for the selected platform.

## Explicit Non-Goals

- No PostgreSQL migration in MS5.
- No pgvector introduction in MS5.
- No AI feature implementation in MS5.
- No production secret creation or disclosure.
- No paid service selection.
- No Gitee push requirement unless the user changes priority.

## Next Decisions

Before production deployment, create separate worktracks for:

1. Hosting platform selection and cost/security review.
2. Production database decision and migration plan.
3. Upload storage adapter and persistence plan.
4. Secret management and operator runbook.
5. Deployment workflow and rollback verification.
