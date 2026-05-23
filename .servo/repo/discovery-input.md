# Repo Discovery Input

> 只读事实输入，供 Goal Charter 参考。不作为目标真相。

## Metadata

- discovered_at: 2026-05-23
- discovered_by: harness-kernel (existing-code-adoption)
- baseline_branch: develop
- baseline_commit: 30045cbe49bfba90141baf743ed4cb26dd525717

## Project Facts

### 身份

- 项目名: ReqFlow (package.json name: feature-scaffold)
- 定位: 轻量级公司内部工单需求协作系统
- 仓库: E:\repos\personal\reqflow

### 技术栈

- Next.js 16.2.6 + React 19.2.4 + TypeScript 5
- TailwindCSS v4 + @tailwindcss/postcss
- Prisma 5.22 + SQLite
- NextAuth v5.0.0-beta.31 (credentials provider)
- Radix UI 组件库 + Lucide React 图标
- bcryptjs 密码哈希

### 已完成阶段 (git log 事实)

| Phase | 内容 | 合并提交 |
|-------|------|---------|
| Scaffold | 项目脚手架、数据模型、基础 API、页面 | 27de6a8 |
| Phase 6 | 协作者权限 + 角色变更 + 角色 Badge + Dashboard Tab | c4a702c |
| Phase 7 | 附件上传 API + 拖拽上传 UI | 316fc0f |
| Phase 8 | 通知系统 + 铃铛 Badge + 通知列表 | 4965c10 |

### 已实现功能清单

**数据模型** (7 个):
User, Ticket, TicketMember, TicketComment, TicketLog, TicketAttachment, Notification

**API 端点** (已验证存在于源码):
- Auth: GET /api/auth/me
- Tickets: GET/POST /api/tickets, GET/PATCH/DELETE /api/tickets/[id]
- Comments: GET/POST /api/tickets/[id]/comments
- Members: GET/POST/DELETE /api/tickets/[id]/members, PATCH role
- Attachments: POST/GET /api/tickets/[id]/attachments, DELETE /api/tickets/[id]/attachments/[id]
- Notifications: GET /api/notifications, PATCH /api/notifications/[id], POST /api/notifications/read-all
- Logs: GET /api/tickets/[id]/logs
- Users: GET /api/users

**页面**:
/login, / (dashboard), /tickets, /tickets/new, /tickets/[id], /notifications

## 已知风险与缺口 (来自 handoff.md)

1. **TailwindCSS v4 破坏性变更**: `@apply border-border` 等语法需要适配
2. **NextAuth v5 beta**: API 可能变化
3. **SQLite 生产限制**: 不适合并发写入，需考虑后续迁移 PostgreSQL
4. **无邮件通知**: 仅站内通知
5. **Windows 验证限制**: 无法在非交互式 shell 启动 dev server 进行运行时测试
6. **测试覆盖**: 当前已有 Vitest 基础单元测试，route handler 集成测试仍缺失
7. **ESLint 状态**: `npm run lint` 已确认 0 warning

## 候选目标信号

1. 项目基本面更新（文档、README、构建配置完善）
2. 分模块代码质量治理（按功能模块逐步 repair/refactor/test）
3. Known issues 修复（handoff.md 中记录的已知问题）
4. 补充测试覆盖（核心 API + 关键业务逻辑）

## 待确认问题

- 分模块治理的模块划分粒度？
- 是否需要在此阶段引入 PostgreSQL 迁移？
- 邮件通知是否需要纳入近期计划？
