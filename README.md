# ReqFlow

ReqFlow is a lightweight internal ticket/request collaboration system built with Next.js 16, React 19, TypeScript, TailwindCSS v4, Prisma 5, SQLite, and NextAuth v5 beta.

## Local Setup

```bash
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

Run these from the active worktree root, not from the main checkout:

```bash
npm run lint
npm run build
npm run db:validate
```

`npm run db:validate` requires `.env`; copy `.env.example` to `.env` first. The committed `.env.example` contains only local development placeholders and no secrets.

Next.js 16 uses Turbopack by default. This repo sets `turbopack.root` to `process.cwd()` so a nested git worktree resolves modules from the current worktree instead of the parent checkout.

## Harness Workflow

Harness-managed code changes should be made from `develop-aw` through dedicated worktrack branches and worktrees. Do not edit the main checkout directly.
