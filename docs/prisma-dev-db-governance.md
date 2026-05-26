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

## Repository Policy

- Do not commit SQLite DB or journal files.
- Do not use DB file diffs as review evidence.
- When a test needs database state, create it through fixtures, migrations, or seed data.
- If a fixture database is ever intentionally needed, put it under a clearly named fixture directory and document why it is stable.

## Migration Notes

This worktrack removes DB files from Git tracking while leaving local files on disk where possible. Existing local DB files may remain in a developer checkout, but new changes should no longer appear in `git status`.

Nested `prisma/prisma/` is treated as accidental runtime output and ignored. It can be deleted locally after confirming no needed data is inside.
