# Repo Snapshot / Status

## Metadata

- updated: 2026-05-26
- baseline_branch: develop
- baseline_commit: 0d42fd562118d3bc7b3c61641cd3811cc12dcd1b

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
| `npm run build` | 通过 (2026-05-26, WT-20260524-022) |
| `npm run lint` | 通过，ESLint 0 warning (2026-05-26, WT-20260524-022) |
| `npm run test` | 通过，10 个测试文件，71 个测试 (2026-05-26, WT-20260524-022) |
| TypeScript strict | 开启 (`tsconfig.json` strict: true) |

### 已知 Issues (来自 handoff.md)

1. TailwindCSS v4 `@apply border-border` 语法需适配
2. NextAuth v5 beta API 风险
3. SQLite 不适合生产并发
4. 无邮件通知
5. 本地 SQLite DB 文件不再作为 Git 跟踪事实，开发环境通过 migration + seed 重建

### 当前治理缺口

1. M4 项目整洁度与 AI 适配治理已完成 WT-018 至 WT-023，剩余 WT-024 最终 CodeReview。
2. `git status` 仍可见未纳入版本库的 `.agents/`, `.claude/`, `.harness/`, `.mavis/`, `.worktrees/`, `.local-backup/`, `docs/phase6-8-plan.md`；这些不是低价值忽略噪声，需按治理文档逐项保留、迁移、延期或由用户决策。
3. `.worktrees/develop-aw` 是注册 worktree，分支 divergent 且 dirty，已明确保留，不自动删除。
4. `develop` 领先远端，GitHub 推送与 CI 尚未在本 milestone 中执行；Gitee 推送被用户降级为非当前重点。

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

### Active Milestone

- milestone_id: MS-20260524-001
- title: 项目整洁度与 AI 适配治理
- status: active
- progress: 7/7 completed at baseline `2534e8634ed298bccabf58591dac61dd08d2bfd0`
- completed_worktracks: WT-20260524-018, WT-20260524-019, WT-20260524-020, WT-20260524-021, WT-20260524-022, WT-20260524-023, WT-20260524-024
- active_or_next_worktrack: Milestone Gate handback
- remaining_worktracks: none
- milestone_gate_verdict: pass
- final_acceptance: accepted
- accepted_by: fdch0
- accepted_at: 2026-05-26 23:33:49 +08:00

### M4 Governance Facts

- `docs/repo-hygiene-matrix.md` records dirty-state classification and ownership boundaries.
- `.gitignore` covers logs, cookies, scratchpad, root QA screenshots, Playwright MCP output, `.opencode` runtime output, and local SQLite DB/journal files.
- `docs/worktree-branch-audit.md` records stale worktree/branch cleanup and retained `develop-aw` risk.
- `AGENTS.md` is the canonical AI collaboration and worktree discipline entrypoint; `docs/ai-collaboration-entrypoints.md` explains auxiliary/local tool boundaries.
- `docs/prisma-dev-db-governance.md` records local-only SQLite DB policy; schema, migrations, and seed remain tracked.
