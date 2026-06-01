# Gate Evidence: WT-20260601-108

## Metadata

- worktrack_id: WT-20260601-108
- milestone_id: MS-13
- status: completed
- updated: 2026-06-01

## Implementation Evidence

- `next.config.ts` enables `output: "standalone"` and pins `turbopack.root` to `process.cwd()` so worktree builds produce `.next/standalone/server.js` in the active checkout instead of the parent checkout.
- `Dockerfile` builds with the npm lockfile, runs `npx prisma generate --schema prisma/schema.prisma`, runs `npm run build`, copies `public`, `.next/standalone`, and `.next/static`, and runs the standalone server as non-root UID `1001`.
- `Dockerfile` installs `ca-certificates` and `openssl` in the shared base used by the runtime stage, which fixes Prisma query engine loading in the slim image.
- `.dockerignore` excludes local secrets, worktrees, `.servo`, local logs, local databases, generated tool state, and model/cache artifacts from the Docker build context.
- `docs/docker-web-runtime-env.md` records required web runtime variables and states that migrations, seed orchestration, compose wiring, embedding sidecar, and BM25 runtime selection are later worktracks.

## Validation Evidence

- `DATABASE_URL=postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public npx prisma validate --schema prisma/schema.prisma`: pass.
- `npm run build`: pass. Next.js 16.2.6 production build completed and `.next/standalone/server.js` exists in the WT-108 worktree.
- `docker build -t reqflow-web:wt-20260601-108 .`: pass.
- Image content probe: `/app/server.js=true`, `/app/public=true`, `/app/public/uploads=true`, `/app/.next/static=true`, `/app/.env=false`, `/app/.servo=false`, `/app/.worktrees=false`, `/app/node_modules/.prisma/client=true`.
- Runtime identity probe: `uid=1001`, `NODE_ENV=production`.
- OpenSSL probe: `OpenSSL 3.0.20`; Prisma `libquery_engine-debian-openssl-3.0.x.so.node` resolves `libssl.so.3`.
- Standalone startup probe: `node -e "setTimeout(() => process.exit(0), 3000); require('./server.js');"` inside `reqflow-web:wt-20260601-108` with local `DATABASE_URL` and `AUTH_SECRET` printed `Ready` and exited with code 0.

## Policy Evidence

- Worktree discipline: changes are in `.worktrees/wt-20260601-108-web-dockerfile`.
- Scope boundary: no compose orchestration, migration startup, embedding model bundling, BM25 runtime claim, or destructive volume/cache action.
- Next.js docs: local `node_modules/next/dist/docs` was absent in this checkout; official Next.js Docker/standalone guidance was used for the standalone output pattern.
- The web image does not copy `.env`, `.servo`, or `.worktrees`; runtime secrets remain environment variables.
- The image build produced npm audit notices for existing dependency metadata, but WT-108 did not change dependency versions and no audit fix was applied.

## Gate Verdict

- implementation-gate: pass
- validation-gate: pass
- policy-gate: pass
- final: pass
