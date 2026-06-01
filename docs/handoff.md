# ReqFlow Project Handoff

## Current Baseline

- repository: `E:\repos\personal\reqflow`
- baseline branch: `develop`
- current active milestone: `MS-13 / Docker Compose Runtime Bundle 与本地一键运行`
- current database provider: PostgreSQL
- current AI provider decision: Deepseek through a server-side provider adapter
- current operator runbook: `docs/ms13-runtime-operator-runbook.md`

All code and documentation edits must be made in a Git worktree and merged back to `develop`. See `AGENTS.md`.

## Product State

ReqFlow is a lightweight internal ticket requirement collaboration system.

Implemented operator surfaces:

| Area | Surface | Status |
|------|---------|--------|
| Authentication | `/login`, `/api/auth/me` | implemented |
| Tickets | list, create, detail, update, delete, status, filters | implemented |
| Comments | ticket detail comments | implemented |
| Members | collaborator add/remove and role change | implemented |
| Attachments | upload, list, delete, preview | implemented |
| Notifications | notification bell, list, mark read | implemented |
| Logs | ticket audit log | implemented |
| Admin AI Provider | `/admin/ai-provider` | implemented |
| Admin Knowledge Base | `/admin/knowledge` | implemented |
| AI Requirement Discussion | `/tickets/ai-discussion` | implemented |

## Current Architecture Facts

- Next.js 16, React 19, TypeScript 5, TailwindCSS 4, Prisma 5, NextAuth v5 beta.
- Prisma datasource provider is PostgreSQL.
- Local development can use `docker-compose.postgres.yml`; MS-13 also provides
  `docker-compose.runtime.yml` for local product inspection with web,
  PostgreSQL/pgvector, and an optional embedding sidecar.
- API route tests use isolated PostgreSQL schemas.
- Knowledge-base upload supports documents and zip archives with path preservation.
- Knowledge bases can be created, edited, enabled/disabled, and selected in the AI discussion flow.
- Knowledge sources and snippets can be enabled/disabled; selected deletion and clear operations exist.
- AI clarification uses fixed directions and per-question answers.
- AI draft generation supports language behavior and multiple draft candidates, with one selected draft staged into the existing ticket form.

## Hybrid Search And AI Draft Facts

MS-9 and MS-10 established and implemented the PostgreSQL-backed hybrid retrieval baseline:

- `EmbeddingProviderConfig` is separate from `AiProviderConfig`.
- `SearchIndexProfile` locks provider, model, dimensions, and semantic space.
- pgvector is available in local dev/test/CI through the `pgvector/pgvector:0.8.2-pg16` image.
- Native PostgreSQL FTS fallback is the required lexical path in the current image.
- `pg_search` is not available by default and cannot be claimed as active BM25 behavior until a target environment passes readiness.
- Retrieval uses query understanding, lexical search, vector candidates, RRF-style fusion, filter evidence, context-window construction, and citation grouping.
- AI draft provider context comes only from the bounded Context Window Builder output.
- Citation UI and admin debug evidence expose provenance without provider secrets.

Detailed hybrid search and AI draft operator flow remains in
`docs/operator-hybrid-search-ai-draft.md`.

## Docker Runtime Bundle Facts

MS-13 packages the local runtime path without productionizing deployment:

- `docker-compose.runtime.yml` starts PostgreSQL/pgvector and the web image by
  default.
- `docs/ms13-runtime-operator-runbook.md` documents start, migrate, seed,
  smoke, logs, stop, optional embedding probe, cache/volume policy, and
  troubleshooting.
- `npm run runtime:smoke` waits for PostgreSQL, runs `prisma migrate deploy`,
  optionally runs seed, runs PostgreSQL/search readiness, and checks the web
  login URL.
- The optional embedding sidecar is profile-gated and not started by the default
  `postgres web` command.
- The default runtime remains PostgreSQL native FTS fallback plus pgvector.
  BM25 is not enabled in the default compose bundle.
- Standard runtime commands must not delete volumes, uploads, model cache, or
  database state.

## Milestone Status

Accepted milestones include:

- Phase 6-8 base feature work.
- MS-20260523-003 API route handler integration tests.
- MS-20260524-001 repo hygiene and AI collaboration governance.
- MS-20260526-001 GitHub CI and cloud readiness boundary.
- MS-20260526-002 AI requirement Discussion MVP.
- MS-20260527-001 administrator knowledge-base management and import.
- MS-20260528-001 knowledge-base folder management and modular AI draft scope.
- MS-20260528-003 MS8 addendum.
- MS-9 PostgreSQL and Hybrid Search architecture baseline.
- MS-10 knowledge index and Hybrid Retrieval implementation.

Active milestone:

- MS-13 is active.
- Completed: WT-108 web Dockerfile/runtime env contract; WT-109 compose runtime
  bundle; WT-110 migrate/readiness/web smoke orchestration; WT-111 BM25 runtime
  feasibility and fallback packaging.
- Remaining planned work before final handback: WT-112 operator runbook/local
  smoke acceptance; WT-113 Docker runtime final validation and CodeReview.
- Final MS-13 acceptance remains fdch0-only.

## Local Setup

```bash
npm install
docker compose -f docker-compose.postgres.yml up -d postgres
npm run postgres:wait
$env:DATABASE_URL="postgresql://reqflow:reqflow@127.0.0.1:5432/reqflow_dev?schema=public"
npx prisma migrate deploy --schema prisma/schema.prisma
npm run db:seed
npm run dev
```

Open `http://localhost:3000/login`.

For the MS-13 runtime bundle:

```bash
AUTH_SECRET="replace-with-a-local-secret" docker compose -f docker-compose.runtime.yml up -d --build postgres web
RUNTIME_POSTGRES_PORT="5432" RUNTIME_WEB_URL="http://127.0.0.1:3000/login" RUNTIME_RUN_SEED=true npm run runtime:smoke
```

## Test Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| manager | manager123 | Manager |
| user | user123 | User |

Do not send test account passwords to AI providers.

## Validation Commands

Use these for milestone/worktrack validation unless the contract narrows scope:

```bash
npm run lint
npm run test
npm run build
npm run retrieval:evaluate
npm run postgres:readiness
npm run search:extensions
git diff --check
```

For PostgreSQL-specific commands, use an explicit PostgreSQL `DATABASE_URL`.

## Key Documents

| Document | Purpose |
|----------|---------|
| `AGENTS.md` | Worktree discipline and AI collaboration entrypoint |
| `README.md` | Project entrypoint and current quick start |
| `docs/operator-hybrid-search-ai-draft.md` | Current operator runbook for knowledge retrieval and AI draft |
| `docs/ms13-runtime-operator-runbook.md` | Current MS-13 Docker runtime operator runbook |
| `docs/docker-compose-runtime-bundle.md` | Compose bundle service and boundary contract |
| `docs/cloud-readiness-boundary.md` | Pre-cloud deployment and production risk boundary |
| `docs/prisma-postgres-provider-boundary.md` | Prisma PostgreSQL provider migration boundary |
| `docs/search-extension-readiness.md` | pgvector/native FTS/pg_search readiness boundary |
| `docs/hybrid-search-architecture.md` | Hybrid retrieval architecture decision |
| `docs/local-embedding-docker-feasibility.md` | Local CPU embedding sidecar feasibility verdict |
| `docs/ms11-chinese-business-e2e-validation.md` | MS-11 Chinese business E2E validation record |
| `docs/ms11-postgres-extension-readiness.md` | MS-11 PostgreSQL/extension readiness record |

MS6-era AI documents remain useful historical design records, but they do not describe the current full retrieval implementation.

## Known Boundaries

1. Production deployment is not decided.
2. Production database backup, restore, pooling, and migration runbook remain future work.
3. Upload storage is still local filesystem by default; cloud persistence requires a separate storage decision.
4. `pg_search` is optional/unavailable in the current local image; native PostgreSQL FTS fallback is active.
5. Local CPU embedding model sidecar is implemented as an optional local PoC and
   MS-13 compose profile, but it is not the default production path.
6. AI output is advisory and cannot directly create or mutate tickets.
7. Untracked local tool/governance directories such as `.agents/`, `.claude/`, `.harness/`, `.mavis/`, `.local-backup/`, and `.worktrees/` must not be bulk committed or deleted without explicit decision.
