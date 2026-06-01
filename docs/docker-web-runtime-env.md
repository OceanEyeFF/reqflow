# Web Runtime Image Environment Contract

## Scope

This contract covers the MS-13 WT-20260601-108 web application image only.
It does not define the Compose bundle, migration orchestration, seed flow,
embedding sidecar wiring, BM25 runtime choice, production deployment, backups,
or destructive volume/cache cleanup.

## Image Contract

- Dockerfile: `Dockerfile`
- Base runtime: `node:20-bookworm-slim`
- Build command: `npm run build`
- Next.js runtime: standalone output from `.next/standalone/server.js`
- Runtime user: non-root `nextjs`
- Exposed port: `3000`
- Upload path inside container: `/app/public/uploads`

The image copies only the standalone server output, `public`, and `.next/static`.
It does not copy local `.env*`, `.servo`, worktrees, logs, local databases,
model cache, or generated tool state.

## Required Runtime Variables

| Variable | Required | Purpose | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | Prisma PostgreSQL connection | Must point at the target PostgreSQL database, for example `postgresql://reqflow:reqflow@postgres:5432/reqflow_dev?schema=public` in a Compose network. |
| `AUTH_SECRET` | yes | NextAuth session secret | Must be a strong per-environment secret. Do not bake it into the image. |

## Optional Runtime Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Next.js standalone server port. |
| `HOSTNAME` | `0.0.0.0` | Bind address inside the container. |
| `DEEPSEEK_API_KEY` | unset | Server-side provider authentication for real AI calls. |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | Deepseek-compatible base URL. |
| `DEEPSEEK_MODEL` | `deepseek-v4-flash` | Chat model used by the server-side adapter. |
| `DEEPSEEK_TIMEOUT_MS` | `20000` | Provider request timeout. |
| `AI_MAX_DRAFTS` | app default | Maximum AI draft count accepted by the draft service. |

Embedding sidecar variables such as `LOCAL_EMBEDDING_BASE_URL`,
`LOCAL_EMBEDDING_PATH`, `LOCAL_EMBEDDING_REQUEST_FORMAT`,
`LOCAL_EMBEDDING_MODEL`, and `LOCAL_EMBEDDING_DIMENSIONS` belong to later
MS-13 Compose and probe worktracks. They are not required by this web image
contract.

## Build And Run Smoke

Build the image:

```bash
docker build -t reqflow-web:local .
```

Run it against an existing PostgreSQL database:

```bash
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://reqflow:reqflow@host.docker.internal:5432/reqflow_dev?schema=public" \
  -e AUTH_SECRET="replace-with-a-local-secret" \
  reqflow-web:local
```

Before opening the app, run migrations and seed through a separate operator
step. The web image intentionally does not run migrations or seed on startup.

## Boundaries

- Do not pass production secrets in build args.
- Do not mount or delete PostgreSQL volumes from this image.
- Do not place embedding model weights in this image.
- Do not claim BM25 runtime support from this image. BM25 extension feasibility
  remains a separate MS-13 worktrack.
