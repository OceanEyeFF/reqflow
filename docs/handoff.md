# ReqFlow 项目交接文档

## 项目概览

**项目名称**: ReqFlow - 轻量级公司内部工单需求协作系统  
**仓库路径**: `E:\repos\personal\reqflow`  
**Harness 基线分支**: `develop-aw`  
**当前交接状态**: MiniMax 初始化代码已纳入 Harness 评估；验证环境、lint 质量基线、runtime smoke 基线、dashboard/ticket flow 修复、附件、通知、评论和协作者本地验收事实已建立。
**技术栈**: Next.js 16.2.6 + React 19.2.4 + TypeScript + TailwindCSS v4 + Prisma 5 + SQLite + NextAuth v5 beta

---

## 已验证基线

- 基线 worktree: `E:\repos\personal\reqflow\.worktrees\develop-aw`
- 最新已验证业务 checkpoint: `0e1807a251bc3c79e0967b8ceda6a3ee09c7ae92`
- 最新已验收 checkpoint: `4179629cdb71cd00c0e52c09dc346035d8147f82`
- 当前 Milestone: `MS-20260522-003` - Collaboration Surface Acceptance
- 已完成 worktrack:
  - `WT-20260522-001-validation-environment-baseline`: 建立 `.env.example`、`db:validate`、Turbopack worktree root 和验证说明。
  - `WT-20260522-002-lint-quality-baseline`: 修复当前 ESLint errors/warnings，使 lint/build/db validate 在基线 worktree 通过。
  - `WT-20260522-003-docs-handoff-catch-up`: 将 operator-facing handoff 文档追平到已验证基线。
  - `runtime-dashboard-route-hotfix`: 修复 `/` 登录后仍显示 create-next-app 默认页的问题。
  - `WT-20260522-004-runtime-smoke-suite`: 建立 Playwright runtime smoke 命令和截图证据。
  - `WT-20260522-005-dashboard-ticket-flow-fixes`: 修复 admin 个人 scope 列表语义和新建工单优先级标签显示。
  - `WT-20260522-006-runtime-docs-catch-up`: 追平 runtime smoke 和本地运行边界文档。
  - `WT-20260522-015-ms002-final-handoff-refresh`: 修正 MS-002 收尾交接状态，避免 handoff 指向已关闭 worktrack。
  - `WT-20260522-007-attachment-end-to-end-validation`: 建立附件上传、列表、鉴权下载、删除和 smoke 截图证据。
  - `WT-20260522-008-notification-user-surface`: 建立通知铃铛、未读列表、单条已读、全部已读和通知跳转工单的 smoke 截图证据。
  - `WT-20260522-009-member-comment-interaction-hardening`: 建立非参与者访问拒绝、协作者添加/改角色、成员通知跳转和成员评论 smoke 证据。
- 当前 milestone: `MS-20260522-003` - Collaboration Surface Acceptance。
- 当前 worktrack: `WT-20260522-010-collaboration-docs-catch-up`；下一步为 MS-003 Gate 与最终 CodeReview。

---

## 启动项目

在 Harness 管理的 worktree 根目录执行：

```powershell
cd E:\repos\personal\reqflow\.worktrees\develop-aw
npm install
Copy-Item .env.example .env
npm run db:validate
npm run db:seed
npm run dev
```

打开 `http://localhost:3000/login`。

## 测试账号

| 用户名 | 密码 | 角色 |
| --- | --- | --- |
| admin | admin123 | 管理员 |
| manager | manager123 | 项目经理 |
| user | user123 | 普通用户 |

---

## 验证命令

从当前 worktree 根目录执行：

```powershell
npm run lint
npm run build
npm run db:validate
npm run smoke
```

已验证状态：

- `npm run lint`: 通过，0 errors。
- `npm run build`: 通过，Next.js 16.2.6 production build 和 TypeScript check 通过。
- `npm run db:validate`: 通过；需要先把 `.env.example` 复制为被忽略的 `.env`。
- `npm run smoke`: 通过；使用 Playwright + 本机 Chrome channel 启动 Next dev server，覆盖登录、工作台、工单列表、工单详情、附件上传/下载/删除、协作者添加/改角色、成员评论、通知未读/已读操作、通知跳转、新建工单和退出。

说明：

- `.env.example` 只包含本地开发占位值，不包含 secret。
- Next.js 16 默认使用 Turbopack，本仓库在 `next.config.ts` 中设置 `turbopack.root = process.cwd()`，用于让嵌套 worktree 从当前 worktree 解析依赖。
- 如果新 worktree 没有本地 `node_modules`，先运行 `npm install`，否则 build 可能无法从 worktree 正确解析 Next.js package。
- Playwright 默认项目使用本机 Chrome channel；如果需要切换浏览器 channel，可设置 `SMOKE_BROWSER_CHANNEL`。
- Playwright 托管 Chromium 下载在本机网络环境中可能失败；当前已验证路径不依赖托管浏览器下载。
- Smoke 截图输出到被忽略目录 `test-results/smoke/`，用于本地画面验收和问题复核。

## Runtime Smoke 覆盖

`npm run smoke` 当前执行 `tests/smoke/core-workflow.spec.ts`，覆盖：

- `/login` 使用 `admin/admin123` 登录。
- 登录后进入 `/` 工作台。
- Dashboard 默认“待我处理”显示 0 和空列表。
- Dashboard tab 切换到“我发起的”并显示示例工单。
- 工单详情页加载评论、状态区、详情区和协作者区。
- 非参与者已登录用户不能读取无关工单详情、评论或协作者列表。
- 管理员在工单详情添加协作者、调整协作者角色并新增评论。
- 被添加的协作者通过通知进入工单详情并新增评论。
- `/tickets` 列表页切换到“全部工单”并显示示例工单。
- `/tickets/new` 新建工单页面可达，优先级下拉显示中文标签并保留内部值。
- 附件上传、鉴权下载和删除流程。
- 新建分配给项目经理的工单并触发通知。
- 项目经理查看通知未读数、通知菜单、单条已读、全部已读，并从通知进入工单详情。
- 点击“退出”返回登录页。

已由 `WT-20260522-005-dashboard-ticket-flow-fixes` 修复并纳入 smoke 断言：

- Admin 访问个人 scope 时不再绕过 scope 过滤；只有显式 `scope=all` 才查看全部工单。
- 未知 ticket scope 默认回到 `assigned_to_me`，避免意外宽读。
- 新建工单页“优先级”下拉显示 `低 / 中 / 高 / 紧急`，提交值仍为内部枚举值。

---

## 当前功能面

### 认证和用户

- Credentials 登录，入口为 `/login`。
- NextAuth v5 beta 配置在 `src/auth/index.ts`。
- 当前用户 API: `GET /api/auth/me`。
- 用户列表 API: `GET /api/users`。
- 用户角色: `admin`, `manager`, `user`。

### 工单核心

- 页面:
  - `/` - 工作台首页，展示统计和最近工单。
  - `/tickets` - 工单列表，支持 scope/status/priority/keyword 筛选。
  - `/tickets/new` - 新建工单。
  - `/tickets/[id]` - 工单详情，支持状态、负责人、优先级、评论、协作者、附件和操作记录。
- API:
  - `GET/POST /api/tickets`
  - `GET/PATCH/DELETE /api/tickets/[id]`
  - `GET /api/tickets/stats`
  - `GET/POST /api/tickets/[id]/comments`
  - `GET /api/tickets/[id]/logs`
  - `GET/POST/DELETE/PATCH /api/tickets/[id]/members`

### 附件和通知

- 附件工作流已完成本地验收:
  - Prisma model: `TicketAttachment`
  - API: `GET/POST/DELETE /api/tickets/[id]/attachments`
  - 下载 API: `GET /api/tickets/[id]/attachments/[attachmentId]/download`
  - 页面: `/tickets/[id]` 右侧附件卡片支持上传、列表、下载和删除。
- 通知用户界面已完成本地验收:
  - Prisma model: `Notification`
  - API: `GET /api/notifications`
  - API: `PATCH /api/notifications/[id]`
  - API: `PATCH /api/notifications/read-all`
  - 页面: 登录后顶部导航右侧通知铃铛，支持未读数、通知列表、单条已读、全部已读和跳转关联工单。
- 当前交接确认附件和通知在本地开发环境的用户可见行为；不声明生产文件存储、恶意文件扫描、外部邮件/推送或实时消息能力已经完成。

### 评论和协作者

- 评论工作流已完成本地验收:
  - API: `GET/POST /api/tickets/[id]/comments`
  - 非参与者访问被拒绝；授权参与者可以新增评论并触发站内通知。
  - 单条评论上限为 2000 字。
- 协作者工作流已完成本地验收:
  - API: `GET/POST/DELETE/PATCH /api/tickets/[id]/members`
  - 可修改成员范围: admin、工单发起人、负责人、owner 协作者。
  - 支持角色: `owner`, `collaborator`, `watcher`。
  - 页面支持添加协作者、修改协作者角色、移除协作者，并显示相关操作记录。
- 当前交接确认本地权限和用户可见行为；不声明完整生产审计、复杂角色矩阵或实时协作能力已经完成。

---

## 数据模型

Prisma schema 当前包含：

- `User`
- `Account`
- `Session`
- `VerificationToken`
- `Ticket`
- `TicketMember`
- `TicketComment`
- `TicketLog`
- `TicketAttachment`
- `Notification`

SQLite 开发数据库和 migrations 位于 `prisma/`。修改 `prisma/schema.prisma` 后需要评估 migration、seed 和验证命令影响。

---

## 工作流和治理规则

- 不要直接修改主 checkout。
- Harness 管理基线为 `develop-aw`。
- 新工作应从 `develop-aw` 创建专用 worktrack branch 和 worktree，验证通过后再合并回 `develop-aw`。
- Next.js 相关代码或配置改动前，必须读取安装包中的相关文档：`node_modules/next/dist/docs/`。
- 当前仓库没有配置 `origin` remote，不能依赖远端 fetch/PR 流程，除非先补齐 remote。
- 数据库二进制文件和本地上传文件不应被无关 worktrack 修改。

示例：

```powershell
git worktree add .worktrees/WT-xxxx -b worktrack/WT-xxxx develop-aw
cd .worktrees/WT-xxxx
```

---

## 关键文件路径

| 文件 | 说明 |
| --- | --- |
| `README.md` | 本地启动、验证命令和 Harness 工作流入口 |
| `.env.example` | 本地开发环境变量示例 |
| `next.config.ts` | Next.js/Turbopack worktree root 配置 |
| `prisma/schema.prisma` | 数据库模型定义 |
| `prisma/seed.ts` | 本地 seed 数据和测试账号 |
| `src/auth/index.ts` | NextAuth credentials 配置 |
| `src/lib/prisma.ts` | Prisma Client 单例 |
| `src/types/index.ts` | 工单状态、优先级、类型、角色常量 |
| `src/app/(dashboard)/` | 登录后页面 |
| `src/app/api/` | App Router route handlers |
| `.servo/` | Harness 控制面、milestone、worktrack 和 repo 状态 |

---

## 已知风险和后续方向

- 当前已有首个 Playwright runtime smoke；仍缺少更完整的 unit/API/e2e 覆盖。
- SQLite 和本地文件上传适合本地开发，不代表生产数据库和文件存储策略已经完成。
- NextAuth v5 beta 和 Next.js 16 行为对版本敏感，后续改动必须以安装文档和实际验证为准。
- 用户管理页面、标签、全文搜索、统计报表、外部消息集成和生产化部署仍属于后续 worktrack，不应混入治理基线 worktrack。

---

*交接更新时间: 2026-05-23*
*交接来源: Harness `WT-20260522-010-collaboration-docs-catch-up`*
