# Prisma Development Database Governance

## Decision

SQLite database files are local runtime artifacts, not repository truth.

The repository should version:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `prisma/seed.ts`
- tests and helpers that create isolated test databases

The repository should not version:

- `dev.db`
- `dev.db-journal`
- `prisma/dev.db`
- `prisma/dev.db-journal`
- nested runtime output under `prisma/prisma/`

## Rationale

1. SQLite files change during local app use, tests, migrations, and manual debugging.
2. Committing mutable binary DB state makes unrelated local actions appear as source changes.
3. `prisma/schema.prisma`, migrations, and seed scripts are reproducible and reviewable.
4. Test databases are already isolated under `prisma/test-dbs/` and ignored.

## Local Setup

For local development:

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

The local `.env` may keep:

```bash
DATABASE_URL="file:./dev.db"
AUTH_SECRET="..."
```

With Prisma, `file:./dev.db` is resolved relative to `prisma/schema.prisma`, so the normal local database path is `prisma/dev.db`.

## Worktree Dependency Setup

Every Git worktree is a separate checkout. Before running `npm run test`, `npm run build`, `npm run dev`, or any command that imports Prisma from a worktree, initialize dependencies inside that worktree:

```bash
npm install
npx prisma generate
```

For a clean CI-like validation, `npm ci` may be used instead of `npm install`.

This prevents the recurring runtime/build failures:

```text
Module not found: Can't resolve '@prisma/client'
Cannot find module 'node_modules/prisma/build/index.js'
```

### Required Rules

- Do not assume the main checkout `node_modules` is available inside a new worktree.
- Do not run Prisma-backed tests in a worktree until `node_modules/prisma`, `node_modules/@prisma/client`, and `node_modules/.prisma/client` exist in that worktree.
- Prefer a real worktree-local install over directory junctions or symlinks to the main checkout.
- If a temporary junction is used for a short validation run, it must be treated as local scratch state and removed before deleting the worktree. Do not recursively delete a junction target that points back into the main checkout.
- After any dependency repair, run `npx prisma generate` before restarting the dev server.
- If `@prisma/client` fails to resolve in the main checkout, repair the main checkout with `npm install` and `npx prisma generate`, then restart the dev server.

### Safe Worktree Cleanup With Dependencies

When removing a worktree that contains dependency junctions or symlinks:

1. Confirm the worktree is registered and merged with `git worktree list --porcelain` and `git branch --merged develop`.
2. Remove the worktree through `git worktree remove <path>`.
3. If Windows leaves a residual directory because of junctions, resolve the target paths before deleting anything.
4. Delete only residual paths that are physically under the intended `.worktrees/<name>` directory.
5. Never use recursive deletion on a path if its resolved target is inside the main checkout `node_modules`.

The preferred way to avoid this cleanup hazard is to install dependencies locally in the worktree and avoid dependency junctions entirely.

## Repository Policy

- Do not commit SQLite DB or journal files.
- Do not use DB file diffs as review evidence.
- When a test needs database state, create it through fixtures, migrations, or seed data.
- If a fixture database is ever intentionally needed, put it under a clearly named fixture directory and document why it is stable.
- Do not commit `node_modules`, generated Prisma client output, or dependency repair artifacts.

## Migration Notes

This worktrack removes DB files from Git tracking while leaving local files on disk where possible. Existing local DB files may remain in a developer checkout, but new changes should no longer appear in `git status`.

Nested `prisma/prisma/` is treated as accidental runtime output and ignored. It can be deleted locally after confirming no needed data is inside.
