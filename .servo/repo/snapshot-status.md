# Repo Snapshot / Status

## Metadata

- updated: 2026-05-27
- baseline_branch: develop
- baseline_commit: 5878d2a85da574d63e07850a66504ebeccd5a7c5

## Codebase State

### 项目结构

```
reqflow/
├── prisma/
│   ├── schema.prisma     # 7 models
│   └── seed.ts           # 3 users + 1 ticket
├── src/
│   ├── app/
│   │   ├── api/          # auth, tickets, notifications, users
│   │   ├── (dashboard)/  # layout, page, tickets, notifications
│   │   └── login/
│   ├── auth/             # NextAuth config
│   ├── components/       # UI components
│   ├── hooks/            # React hooks
│   ├── lib/              # prisma client, utils
│   └── types/            # TypeScript types
├── public/uploads/       # 附件存储
├── docs/                 # 计划、交接与治理文档
├── AGENTS.md             # AI/worktree 协作主入口
└── .servo/               # Harness 控制面与 worktrack/milestone 产物
```

### 已实现功能 (完整清单)

| 模块 | API | 页面 | 状态 |
|------|-----|------|------|
| Auth | login, /api/auth/me | /login | ✅ |
| Tickets | CRUD + list | /tickets, /tickets/new, /tickets/[id] | ✅ |
| Comments | CRUD | (内嵌于 ticket detail) | ✅ |
| Members | CRUD + PATCH role | (内嵌于 ticket detail) | ✅ |
| Attachments | upload/list/delete | (内嵌于 ticket detail) | ✅ |
| Notifications | list/read/read-all | /notifications, NotificationBell | ✅ |
| Logs | read-only list | (内嵌于 ticket detail) | ✅ |
| Users | list | (API only) | ✅ |

### 质量指标 (已验证)

| 指标 | 状态 |
|------|------|
| `npm run build` | 通过 (2026-05-27, WT-20260526-038) |
| `npm run lint` | 通过，ESLint 0 warning (2026-05-27, WT-20260526-038) |
| `npm run test` | 通过，10 个测试文件，83 个测试 (2026-05-27, WT-20260526-038) |
| TypeScript strict | 开启 (`tsconfig.json` strict: true) |
| GitHub Actions CI baseline | 已建立并刷新，覆盖 `npm ci`、`npm run lint`、`npm run test`、`npm run build`；run `26494518202` success for code baseline `bd2789d4e404996b603833757dfa71859d2b0210`; handback docs run `26494818503` success for `a2fddc64b39e0f4ecb09d0ffee8587c27ce153d0` (2026-05-27, WT-20260526-038) |
| Cloud readiness boundary | 已建立，覆盖 `.env`、`AUTH_SECRET`、`DATABASE_URL`、uploads、SQLite production risk、deployment platform boundary (2026-05-27, WT-20260526-028) |
| AI MVP technical brief | 已建立并在 MS6/MS7 planning 中调整，当前 provider 决策为 Deepseek；MS6 聚焦 discussion MVP，MS7 承接管理员知识库上传/导入；no PG/pgvector dependency (2026-05-27) |
| AI discussion product flow | `docs/ai-discussion-product-flow.md` 已建立，覆盖 discussion state machine、draft schema、manual confirmation、current ticket form handoff、Deepseek boundary、MS6/MS7 split、no PG/pgvector dependency (2026-05-27, WT-20260526-031) |
| AI knowledge citation strategy | `docs/ai-knowledge-citation-strategy.md` 已建立，覆盖 8-source `rf-*` whitelist、provider-neutral citation shape、snippet rules、redaction/exclusion policy、empty-context fallback、no upload/zip/PG/pgvector dependency (2026-05-27, WT-20260526-032) |
| AI draft API/provider adapter | `POST /api/ai/draft` and `src/lib/ai/*` 已建立，覆盖 server-side Deepseek adapter、mocked tests、auth、redaction、static knowledge snippets、missing-secret handling、no direct ticket mutation (2026-05-27, WT-20260526-033) |

### 已知 Issues (来自 handoff.md)

1. TailwindCSS v4 `@apply border-border` 语法需适配
2. NextAuth v5 beta API 风险
3. SQLite 不适合生产并发
4. 无邮件通知
5. 本地 SQLite DB 文件不再作为 Git 跟踪事实，开发环境通过 migration + seed 重建

### 当前治理缺口

1. MS-20260524-001 项目整洁度与 AI 适配治理已完成并由用户验收。
2. `git status` 仍可见未纳入版本库的 `.agents/`, `.claude/`, `.harness/`, `.mavis/`, `.worktrees/`, `.local-backup/`, `docs/phase6-8-plan.md`；这些不是低价值忽略噪声，需按治理文档逐项保留、迁移、延期或由用户决策。
3. `.worktrees/develop-aw` 是注册 worktree，分支 divergent 且 dirty，已明确保留，不自动删除。
4. `develop` 已推送到 GitHub `origin/develop`；GitHub Actions CI run `26494518202` 对代码基线 `bd2789d4e404996b603833757dfa71859d2b0210` 通过，handback docs run `26494818503` 对 `a2fddc64b39e0f4ecb09d0ffee8587c27ce153d0` 通过；Gitee 继续 deferred。

### Accepted Milestone

- milestone_id: MS-20260523-003
- title: API route handler 集成测试
- purpose: 为核心 API route handler 建立可重复的集成测试覆盖，保护后续重构和缺陷修复。
- accepted_by: fdch0
- accepted_at: 2026-05-24
- completed_worktracks: WT-20260523-011, WT-20260523-012, WT-20260523-013, WT-20260523-014, WT-20260523-015
- planned_worktracks: none

### Completed Review Worktrack

- WT-20260523-016: 最终 CodeReview Worktrack
- WT-20260524-017: 补充 CodeReview Worktrack

### Recently Accepted Milestone

- milestone_id: MS-20260524-001
- title: 项目整洁度与 AI 适配治理
- status: completed
- progress: 7/7 completed at baseline `2534e8634ed298bccabf58591dac61dd08d2bfd0`
- completed_worktracks: WT-20260524-018, WT-20260524-019, WT-20260524-020, WT-20260524-021, WT-20260524-022, WT-20260524-023, WT-20260524-024
- active_or_next_worktrack: Milestone Gate handback
- remaining_worktracks: none
- milestone_gate_verdict: pass
- final_acceptance: accepted
- accepted_by: fdch0
- accepted_at: 2026-05-26 23:33:49 +08:00

### Accepted Milestone

- milestone_id: MS-20260526-001
- title: GitHub CI 与上云前决策基线
- status: completed
- progress: 8/8 completed at baseline `bd2789d4e404996b603833757dfa71859d2b0210`
- completed_worktracks: WT-20260526-025, WT-20260526-026, WT-20260526-027, WT-20260526-028, WT-20260526-029, WT-20260526-030, WT-20260526-037, WT-20260526-038
- planned_worktracks: none
- active_or_next_worktrack: Milestone Gate handback
- remaining_worktracks: none
- scope_boundary: PostgreSQL/pgvector migration and AI feature implementation are out of MS5 scope.
- CI_baseline: `.github/workflows/ci.yml` exists and uses `npm ci`, Prisma generate, `npm run lint`, `npm run test`, Prisma SQLite build DB preparation, and `npm run build`.
- remote_CI: GitHub Actions run `26494518202` for code baseline `bd2789d4e404996b603833757dfa71859d2b0210` completed with conclusion `success`; job `78019430374` (`lint, test, build`) also succeeded. Handback docs run `26494818503` for commit `a2fddc64b39e0f4ecb09d0ffee8587c27ce153d0` also completed with conclusion `success`; job `78020426471` succeeded.
- cloud_readiness_boundary: `docs/cloud-readiness-boundary.md` documents environment variables, `AUTH_SECRET`, `DATABASE_URL`, upload storage, SQLite production risk, deployment platform requirements, and explicit non-goals for PostgreSQL/pgvector migration, AI implementation, production secrets, paid provider selection, and Gitee.
- ai_mvp_technical_brief: `docs/ai-mvp-technical-brief.md` documents lightweight MVP scope, manual confirmation, knowledge sources, Deepseek provider boundary, server-side `DEEPSEEK_API_KEY` handling, MS6 discussion MVP, MS7 administrator knowledge-base import split, privacy/persistence/testing boundaries, and no PostgreSQL/pgvector or vector database dependency.
- final_review: `docs/ms5-final-review.md` verifies current GitHub remote CI, cloud boundary, AI brief, WT-037 CodeReview, WT-038 hardening, and MS5 scope exclusions are mutually consistent.
- milestone_gate_verdict: pass
- final_acceptance: accepted
- accepted_by: fdch0
- accepted_at: 2026-05-27 14:47:38 +08:00

### Active Milestone

- milestone_id: MS-20260526-002
- title: AI 需求生成 Discussion MVP
- status: active
- progress: 3/6 completed
- depends_on_milestones: MS-20260526-001
- scope_boundary: MS6 uses Deepseek through a server-side adapter and focuses on discussion + structured draft + manual confirmation; administrator knowledge-base upload/docs zip import is deferred to MS7; no PostgreSQL/pgvector dependency.
- completed_worktracks: WT-20260526-031, WT-20260526-032, WT-20260526-033
- active_or_next_worktrack: WT-20260526-034 intake pending
- latest_evidence: WT-20260526-033 merged at `5878d2a85da574d63e07850a66504ebeccd5a7c5`; `npm run lint`, `npm run test`, and `npm run build` passed locally in the worktree after `npm ci`.

### Preparation Work

- current_preparation_milestone: MS-20260526-002
- current_preparation_item: WT-20260526-034 AI 需求生成 Discussion 页面 UI intake
- preparation_goal: build discussion page UI around the internal draft API, with clarification, draft review, citations, failure states, and accept/edit/discard controls.
- provider_decision: Deepseek
- split_decision: administrator knowledge-base upload and docs-style zip import are planned under MS-20260527-001.

### Planned Milestone

- milestone_id: MS-20260527-001
- title: 管理员项目知识库管理与导入
- status: planned
- progress: 0/6 completed
- depends_on_milestones: MS-20260526-002
- scope_boundary: admin-only document/docs-zip upload, private storage, parsing, chunking, version/source records, lightweight retrieval, and citation tracing; no PostgreSQL/pgvector dependency.

### M4 Governance Facts

- `docs/repo-hygiene-matrix.md` records dirty-state classification and ownership boundaries.
- `.gitignore` covers logs, cookies, scratchpad, root QA screenshots, Playwright MCP output, `.opencode` runtime output, local SQLite DB/journal files, and CI-only `prisma/ci.db*` runtime files.
- `docs/worktree-branch-audit.md` records stale worktree/branch cleanup and retained `develop-aw` risk.
- `AGENTS.md` is the canonical AI collaboration and worktree discipline entrypoint; `docs/ai-collaboration-entrypoints.md` explains auxiliary/local tool boundaries.
- `docs/prisma-dev-db-governance.md` records local-only SQLite DB policy; schema, migrations, and seed remain tracked.
