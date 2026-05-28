# Repo Snapshot / Status

## Metadata

- updated: 2026-05-28
- baseline_branch: develop
- baseline_commit: 38492c42f166f4d35c4345a0bb81e547319e5591

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
| `npm run build` | 通过 (2026-05-28, WT-20260528-057) |
| `npm run lint` | 通过，ESLint 0 warning (2026-05-28, WT-20260528-057) |
| `npm run test` | 通过，25 个测试文件，159 个测试 (2026-05-28, WT-20260528-057) |
| TypeScript strict | 开启 (`tsconfig.json` strict: true) |
| GitHub Actions CI baseline | 已建立并刷新，覆盖 `npm ci`、`npm run lint`、`npm run test`、`npm run build`；run `26502063963` success for MS6 validation handback `b5d50b8b8043dc8a35264cf96553955a4697ba8d` (2026-05-27, WT-20260526-036) |
| Cloud readiness boundary | 已建立，覆盖 `.env`、`AUTH_SECRET`、`DATABASE_URL`、uploads、SQLite production risk、deployment platform boundary (2026-05-27, WT-20260526-028) |
| AI MVP technical brief | 已建立并在 MS6/MS7 planning 中调整，当前 provider 决策为 Deepseek；MS6 聚焦 discussion MVP，MS7 承接管理员知识库上传/导入；no PG/pgvector dependency (2026-05-27) |
| AI discussion product flow | `docs/ai-discussion-product-flow.md` 已建立，覆盖 discussion state machine、draft schema、manual confirmation、current ticket form handoff、Deepseek boundary、MS6/MS7 split、no PG/pgvector dependency (2026-05-27, WT-20260526-031) |
| AI knowledge citation strategy | `docs/ai-knowledge-citation-strategy.md` 已建立，覆盖 8-source `rf-*` whitelist、provider-neutral citation shape、snippet rules、redaction/exclusion policy、empty-context fallback、no upload/zip/PG/pgvector dependency (2026-05-27, WT-20260526-032) |
| AI draft API/provider adapter | `POST /api/ai/draft` and `src/lib/ai/*` 已建立，覆盖 server-side Deepseek adapter、mocked tests、auth、redaction、static knowledge snippets、missing-secret handling、no direct ticket mutation (2026-05-27, WT-20260526-033) |
| AI discussion page UI | `/tickets/ai-discussion` 已建立，覆盖 discussion input、AI clarification、answers、draft preview、citations、empty knowledge、errors、accept/discard/reset controls；不直接创建工单 (2026-05-27, WT-20260526-034) |
| AI draft ticket-form handoff | accepted AI draft 使用 browser `sessionStorage` staging，跳转 `/tickets/new?from=ai-draft` 并预填现有表单；最终仍需用户点击创建工单 (2026-05-27, WT-20260526-035) |
| AI discussion MVP final validation | `docs/ms6-ai-discussion-validation.md` 和 `.servo/worktrack/WT-20260526-036/gate-evidence.md` 记录安全治理、DeepSeek 官方 API 复核、draft handoff helper 测试、hydration-safe prefill、malformed JSON 400、无 MS7 scope 混入，以及 MS6 验收证据 (2026-05-27, WT-20260526-036) |
| MS6 supplemental reviews | `docs/ms6-code-review.md` 和 `docs/ms6-expert-evaluation.md` 记录 CodeReview 与专家评议。未发现 Critical/High 或 final-acceptance blocker；MS6 gate verdict 重新变为 pass，并已由程序员在 `b93935da269ed14ce85c28c799d0f4dd7cd9361c` 验收合并 (2026-05-27, WT-20260527-046, WT-20260527-047) |

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

### Accepted Milestone

- milestone_id: MS-20260526-002
- title: AI 需求生成 Discussion MVP
- status: completed
- progress: 8/8 completed and accepted at baseline `b93935da269ed14ce85c28c799d0f4dd7cd9361c`
- depends_on_milestones: MS-20260526-001
- scope_boundary: MS6 uses Deepseek through a server-side adapter and focuses on discussion + structured draft + manual confirmation; administrator knowledge-base upload/docs zip import is deferred to MS7; no PostgreSQL/pgvector dependency.
- completed_worktracks: WT-20260526-031, WT-20260526-032, WT-20260526-033, WT-20260526-034, WT-20260526-035, WT-20260526-036, WT-20260527-046, WT-20260527-047
- active_or_next_worktrack: Milestone Gate handback
- latest_evidence: WT-20260527-047 merged at `cc0c8da03fc1382e4d7af7b720e23dc4fd76eec6`; expert evaluation found no MS6 final-acceptance blocker. Fresh WT-047 validation passed with `npm ci`, `git diff --check`, `npm run lint`, `npm run test` (15 files / 104 tests), and `npm run build`. GitHub Actions run `26502063963` previously completed with conclusion `success` for MS6 validation handback commit `b5d50b8b8043dc8a35264cf96553955a4697ba8d`.
- milestone_gate_verdict: pass
- final_acceptance: accepted
- accepted_by: fdch0
- accepted_at: 2026-05-27
- completed_supplemental_worktracks: WT-20260527-046, WT-20260527-047
- planned_supplemental_worktracks: none

### Accepted Milestone

- milestone_id: MS-20260527-001
- title: 管理员项目知识库管理与导入
- status: completed
- progress: 11/11 completed and accepted at baseline `8ac2a235bde15e2698be1f9bffa55b13f38c0805`
- depends_on_milestones: MS-20260526-002
- scope_boundary: admin-only AI Provider configuration, document/docs-zip upload, private storage, parsing/chunking, source/version records, lightweight retrieval, citation tracing, zip folder-like handling, source deletion/full clear controls, and provider manual validation template; no PostgreSQL/pgvector dependency.
- completed_worktracks: WT-20260527-039, WT-20260527-045, WT-20260527-040, WT-20260527-041, WT-20260527-042, WT-20260527-043, WT-20260527-044, WT-20260528-048, WT-20260528-049, WT-20260528-050, WT-20260528-057
- latest_evidence: WT-20260528-057 merged before acceptance; final validation before acceptance passed `npm run lint`, `npm run test` (25 files / 159 tests), and `npm run build`.
- milestone_gate_verdict: pass
- final_acceptance: accepted
- accepted_by: fdch0
- accepted_at: 2026-05-28
- acceptance_note: accepted after limited manual flow testing; DS API and local OpenAI-compatible API manual validation records remain operator-run checks.
- next_planned_milestone: MS-20260528-002 docs 文档更新迭代与整理

### Preparation Work

- current_preparation_milestone: MS-20260528-001
- current_preparation_item: MS8 requirement confirmation answered; MS7 dependency is satisfied and no MS8 worktrack has started yet.
- preparation_goal: initialize the first planned MS8 worktrack without re-opening MS7 scope.
- provider_decision: Deepseek
- split_decision: multiple knowledge bases, multi-file/zip import with path preservation, selected deletion, AI knowledge-base selection, AI language/multi-draft behavior are planned under MS-20260528-001; docs cleanup is deferred to MS-20260528-002.

### Planned Milestone

- milestone_id: MS-20260528-001
- title: 知识库文件夹化管理与模块化 AI 草稿范围
- status: active
- progress: 0/8 completed
- depends_on_milestones: MS-20260527-001
- scope_boundary: multiple knowledge bases, multi-file/zip import with path preservation, selected deletion, AI discussion page knowledge-base multi-select, AI retrieval by selected knowledge bases, AI answer language option, multi-draft/splitting support, and MS8 integration validation.
- activation_status: activated on 2026-05-28; requirement confirmation answered by fdch0.
- next_step_boundary: WT-20260528-054 completed and merged at 234f401e5263b2e2053c24bbcfaae4404ce7b459; WorktrackScope.Init may proceed for WT-20260528-055 AI 草稿按多知识库范围检索.

### Planned Milestone

- milestone_id: MS-20260528-002
- title: docs 文档更新迭代与整理
- status: planned
- progress: 0/1 completed
- depends_on_milestones: MS-20260528-001
- scope_boundary: docs path update, organization, deduplication, and Prisma/AI/knowledge-base operator-facing documentation after MS8.

### M4 Governance Facts

- `docs/repo-hygiene-matrix.md` records dirty-state classification and ownership boundaries.
- `.gitignore` covers logs, cookies, scratchpad, root QA screenshots, Playwright MCP output, `.opencode` runtime output, local SQLite DB/journal files, and CI-only `prisma/ci.db*` runtime files.
- `docs/worktree-branch-audit.md` records stale worktree/branch cleanup and retained `develop-aw` risk.
- `AGENTS.md` is the canonical AI collaboration and worktree discipline entrypoint; `docs/ai-collaboration-entrypoints.md` explains auxiliary/local tool boundaries.
- `docs/prisma-dev-db-governance.md` records local-only SQLite DB policy; schema, migrations, and seed remain tracked.
