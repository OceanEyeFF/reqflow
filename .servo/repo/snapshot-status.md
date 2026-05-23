# Repo Snapshot / Status

## Metadata

- updated: 2026-05-24
- baseline_branch: develop
- baseline_commit: d9c3c2f4f5ead8c4041ac78e877bad1a7b8f1f92

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
└── docs/                 # 计划与交接文档
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
| `npm run build` | 通过 (2026-05-24) |
| `npm run lint` | 通过，ESLint 0 warning (2026-05-24) |
| `npm run test` | 通过，10 个测试文件，71 个测试 (2026-05-24) |
| TypeScript strict | 开启 (`tsconfig.json` strict: true) |

### 已知 Issues (来自 handoff.md)

1. TailwindCSS v4 `@apply border-border` 语法需适配
2. NextAuth v5 beta API 风险
3. SQLite 不适合生产并发
4. 无邮件通知
5. Windows 非交互式 shell 无法启动 dev server

### 当前治理缺口

1. M3 API route handler 集成测试、最终 CodeReview Worktrack 和补充 CodeReview Worktrack 已完成并通过最终回归。
2. `npm run lint` 通过依赖 ESLint 忽略 agent/control/runtime 目录；这些目录不属于应用源码。

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
