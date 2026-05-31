# Cloud Readiness Boundary

This document records ReqFlow's pre-cloud deployment boundary. It is a decision baseline, not a deployment runbook.

## Current Position

- GitHub is the primary remote for CI/CD work.
- GitHub Actions CI exists and validates `npm ci`, `npm run lint`, `npm run test`, and `npm run build`.
- The application is still optimized for local/internal use with Prisma 5 and PostgreSQL.
- MS5 did not migrate PostgreSQL, add pgvector, implement AI features, choose a paid hosting service, or create production secrets. PostgreSQL provider migration was later moved into MS-9.

## Environment Variables

Production-like environments must provide environment variables through the hosting platform or secret manager. Do not commit real `.env` files or production values.

Required variables:

| Variable | Purpose | Boundary |
|----------|---------|----------|
| `AUTH_SECRET` | NextAuth signing/encryption secret | Must be a strong generated secret per environment. Do not reuse the CI placeholder or development examples. |
| `DATABASE_URL` | Prisma database connection string | Must be a PostgreSQL URL for the current Prisma provider. Production still needs backup, pooling, and deployment decisions before launch. |

Optional future variables should be documented before use. Public browser-exposed variables must use the `NEXT_PUBLIC_` prefix and must not contain secrets.

## Authentication Secret

`AUTH_SECRET` is required for stable NextAuth session behavior outside local throwaway development. Treat it as a secret:

- Generate a unique value per deployed environment.
- Store it only in the hosting platform secret store or equivalent operator-controlled secret manager.
- Rotate it deliberately because active sessions may be invalidated.
- Never commit the value to Git, screenshots, tickets, or documentation.

## Database Boundary

ReqFlow currently uses Prisma with PostgreSQL:

- Local development database: `DATABASE_URL="postgresql://.../reqflow_dev?schema=public"`.
- CI build database: PostgreSQL 16 service with `DATABASE_URL="postgresql://.../reqflow_ci?schema=public"`.
- Test databases are isolated by per-test PostgreSQL schemas created from `TEST_DATABASE_URL`.

Before production launch, confirm PostgreSQL operations rather than treating the local container or CI service as a production plan:

| Path | Allowed Now | Notes |
|------|-------------|-------|
| Use PostgreSQL for app data | Yes | Requires production hosting, backup, restore, pooling, and migration runbook decisions. |
| Revert to SQLite for a temporary single-instance evaluation | No by default | Would require explicit risk acceptance and a rollback worktrack. |
| Add pgvector or vector search | Out of this cloud boundary | Extension readiness belongs to MS-9 WT-081 and later implementation worktracks. |

Do not treat a successful local PostgreSQL container or CI service as proof that production database risk is solved.

## Search And Embedding Boundary

MS-9 through MS-11 have now established local/dev/test readiness for PostgreSQL native FTS fallback, pgvector, hybrid retrieval, Context Window Builder citations, and AI draft debug evidence. That does not automatically make the same deployment shape production-ready.

Before cloud deployment, confirm:

- the selected PostgreSQL host supports required extensions and index shapes, especially pgvector;
- `pg_search` / BM25 is not assumed unless the target environment passes an explicit readiness gate;
- native PostgreSQL FTS fallback remains available and validated when `pg_search` is unavailable;
- embedding provider configuration, model, dimensions, and `SearchIndexProfile` lifecycle are operationally locked;
- local CPU embedding sidecar deployment, if used, has an explicit image, model revision, resource limit, health check, timeout, and reindex plan.

The current local CPU embedding model verdict is documented in `docs/local-embedding-docker-feasibility.md`: feasible as a sidecar service, not recommended as model weights bundled into the main Next.js app image by default.

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

- No PostgreSQL migration in MS5; later MS-9 work moved the Prisma provider boundary to PostgreSQL.
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
