# ReqFlow

ReqFlow is a lightweight internal ticket/request collaboration system built with Next.js 16, React 19, TypeScript, TailwindCSS v4, Prisma 5, SQLite, and NextAuth v5 beta.

## Local Setup

Run commands from the active worktree root, usually `E:\repos\personal\reqflow\.worktrees\develop-aw`.

```powershell
npm install
Copy-Item .env.example .env
npm run db:validate
npm run db:seed
npm run dev
```

Open `http://localhost:3000/login`.

## Test Accounts

| Username | Password | Role |
| --- | --- | --- |
| admin | admin123 | admin |
| manager | manager123 | manager |
| user | user123 | user |

## Validation Commands

```powershell
npm run lint
npm run build
npm run db:validate
npm run smoke
```

Notes:

- `npm run db:validate` requires `DATABASE_URL`; copy `.env.example` to ignored `.env` for normal local use, or set `$env:DATABASE_URL='file:./dev.db'` for one command.
- `npm run smoke` runs Playwright against the local Next dev server and saves screenshots under ignored `test-results/smoke/`.
- The smoke project defaults to the installed Chrome channel. Set `SMOKE_BROWSER_CHANNEL` to use another installed channel.
- Playwright managed Chromium download may fail in this local network environment; the verified smoke path does not depend on that download.

## Runtime Smoke Coverage

`tests/smoke/core-workflow.spec.ts` verifies:

- credentials login with `admin/admin123`;
- authenticated dashboard entry from `/`;
- dashboard assigned scope shows `0` and an empty list for admin seed data;
- dashboard "我发起的" scope shows the seeded sample ticket;
- ticket detail page opens and shows comments;
- `/tickets` list can show all tickets;
- `/tickets/new` is reachable and priority shows user-facing labels while preserving internal values;
- logout returns to `/login`.

## Harness Workflow

Harness-managed code changes must be made from `develop-aw` through dedicated worktrack branches and worktrees. Do not edit the main checkout directly.

```powershell
git worktree add .worktrees/WT-xxxx -b worktrack/WT-xxxx develop-aw
cd .worktrees/WT-xxxx
```

Next.js code/config changes require reading the installed docs in `node_modules/next/dist/docs/` first. Database binaries and local upload files should not be changed by unrelated worktracks.
