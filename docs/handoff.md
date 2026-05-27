# ReqFlow 项目交接文档

## 项目概览

**项目名称**: ReqFlow - 轻量级公司内部工单需求协作系统
**仓库路径**: `E:\repos\personal\reqflow`
**当前分支**: `develop`
**技术栈**: Next.js 16 + TypeScript + TailwindCSS + Prisma 5 + SQLite + NextAuth
**当前治理状态**: MS5「GitHub CI 与上云前决策基线」已验收；MS6「AI 需求生成 Discussion MVP」已激活并进入准备工作；MS7「管理员项目知识库管理与导入」已注册为 planned

---

## 已完成的工作

### Phase 6-8（2026-05-17 完成）
- ✅ 协作者权限 + 角色变更 API
- ✅ 角色颜色 Badge + 「我参与的工单」Tab
- ✅ 附件上传 API + 拖拽上传 UI
- ✅ 通知系统 + 铃铛 Badge + 通知列表

### 1. Git 环境
- ✅ `master` 分支（初始空提交）
- ✅ `develop` 分支（已合并 scaffold 代码）
- ✅ 开发规范：所有代码走 `feature/<name>` worktree，完成后合并回 develop

### 2. 项目脚手架
- ✅ Next.js 16 初始化（TypeScript, TailwindCSS, ESLint）
- ✅ Prisma 5 + SQLite 配置
- ✅ NextAuth v5 (beta) 配置（credentials provider）
- ✅ 基础 UI 组件（Button, Badge, Card, Input, Label, Textarea）

### 3. 数据模型 (Prisma Schema)
- ✅ `User` - 用户表
- ✅ `Ticket` - 工单表
- ✅ `TicketMember` - 工单协作者表
- ✅ `TicketComment` - 工单评论表
- ✅ `TicketLog` - 操作日志表
- ✅ NextAuth 适配器（Account, Session, VerificationToken）

### 4. REST API
- ✅ `GET/POST /api/tickets` - 工单列表 + 创建
- ✅ `GET/PATCH/DELETE /api/tickets/[id]` - 工单详情 + 更新
- ✅ `GET/POST /api/tickets/[id]/comments` - 评论 CRUD
- ✅ `GET/POST/DELETE /api/tickets/[id]/members` - 协作者管理
- ✅ `GET /api/tickets/[id]/logs` - 操作日志
- ✅ `GET /api/users` - 用户列表
- ✅ `GET /api/auth/me` - 当前用户信息

### 5. 页面
- ✅ `/login` - 登录页
- ✅ `/` (dashboard layout) - 工作台首页（统计卡片 + 最近工单）
- ✅ `/tickets` - 工单列表页（支持 scope/status/priority/keyword 筛选）
- ✅ `/tickets/new` - 新建工单页
- ✅ `/tickets/[id]` - 工单详情页（状态修改、评论、协作者管理、操作日志）

### 6. 测试数据
- ✅ `prisma/seed.ts` 已执行，预置 3 个用户 + 1 条示例工单
- ✅ 本地 SQLite 数据库文件已改为 Git 外运行时产物；使用 migration + seed 重建，不再依赖 tracked `dev.db`

**测试账号**:
| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| manager | manager123 | 项目经理 |
| user | user123 | 普通用户 |

---

## 待完成的工作（按优先级）

## Phase 6: 协作者功能完善

**状态**: ✅ 已完成
**合并分支**: `develop`
**时间**: 2026-05-17

**后端**:
- `canModifyMembers` 权限校验 helper（owner/checker 可操作）
- `PATCH /api/tickets/[id]/members/role` 角色变更 API（含操作日志）

**前端**:
- 角色颜色 Badge（owner=violet, collaborator=green, watcher=gray）
- 工单卡片成员数 + 角色展示
- Dashboard「我参与的工单」Tab 切换

**Worktree 分支**: `feature/phase6-collaborators`（已清理）

---

## Phase 7: 附件上传

**状态**: ✅ 已完成
**合并分支**: `develop`
**时间**: 2026-05-17

**数据库**:
- `TicketAttachment` 模型（fileName, fileUrl, fileSize, mimeType, uploadedBy, ticketId）

**后端**:
- `POST /api/tickets/[id]/attachments` — 上传（含文件大小校验 10MB）
- `GET /api/tickets/[id]/attachments` — 列表
- `DELETE /api/tickets/[id]/attachments/[attachmentId]` — 删除

**前端**:
- 拖拽上传区 + 点击上传
- 进度条 + 上传状态反馈
- 附件列表（文件名、大小、上传者）
- 图片点击预览（Lightbox modal）

**存储**: `public/uploads/` 本地目录

**Worktree 分支**: `feature/phase7-attachments`（已清理）

---

## Phase 8: 通知系统

**状态**: ✅ 已完成
**合并分支**: `develop`
**时间**: 2026-05-17

**数据库**:
- `Notification` 模型（type, title, content, isRead, userId, ticketId, triggeredBy）

**通知类型**:
- `assigned` — 被分配为负责人
- `mentioned` — 被提及
- `member_added` — 被添加为协作者
- `comment_added` — 工单有新评论

**后端**:
- `GET /api/notifications` — 列表 + `unreadCount`（轮询 30s）
- `PATCH /api/notifications/[id]` — 标记已读
- `POST /api/notifications/read-all` — 全部已读

**前端**:
- `NotificationBell` 组件（铃铛 + 未读数 Badge）
- 通知下拉面板（最新 5 条）
- `/notifications` 通知列表页

**轮询间隔**: 30 秒

**Worktree 分支**: `feature/phase8-notifications`（已清理）

---

## 实施顺序

```
Phase 6 ✅ → Phase 7 ✅ → Phase 8 ✅
(全部完成，2026-05-17)
```

---

## 已知问题 / 注意事项

1. **TailwindCSS v4**: 当前使用 TailwindCSS v4，有一些破坏性变更（如 `@apply border-border` 需要改成直接写 CSS 变量）
2. **NextAuth v5**: 使用 beta 版本，API 有变化，需要关注官方更新
3. **Prisma v5**: 已从 v7 回退到 v5，以获得更好的稳定性
4. **SQLite 限制**: SQLite 不适合生产环境并发写入，后续考虑迁移到 PostgreSQL
5. **邮件通知**: Phase 8 暂不包含邮件通知（SMTP 配置待定），仅支持站内通知
6. **本地数据库治理**: `dev.db`、`prisma/dev.db`、`prisma/dev.db-journal` 和嵌套 `prisma/prisma/` 属于本地运行时产物，已从 Git 跟踪中移除并被 `.gitignore` 覆盖
7. **上云前边界**: `.env`、`AUTH_SECRET`、`DATABASE_URL`、上传目录、SQLite 生产风险和部署平台选择边界见 `docs/cloud-readiness-boundary.md`
8. **AI MVP 技术边界**: 轻量 MVP、人工确认、知识来源、Deepseek 接入、MS6 discussion MVP、MS7 管理员知识库导入拆分和无 PG/pgvector 依赖见 `docs/ai-mvp-technical-brief.md`
9. **Worktree 纪律**: 所有代码或文档改动必须在 `.worktrees/<task>` worktree 中完成，合并回 `develop` 后清理 worktree
10. **AI 协作入口**: `AGENTS.md` 是主入口；`CLAUDE.md` 仅指向主入口；`.agents/.claude/.harness/.mavis` 等未注册目录不能批量提交或删除，需按治理文档逐项处理

---

*交接时间: 2026-05-23 (UTC+8)*
*交接人: Mavis (mavis team orchestrator)*

---

## 启动项目

```bash
# 在项目根目录（已切换到 develop）
cd E:\repos\personal\reqflow

# 安装依赖
npm install

# 初始化或更新本地数据库
npx prisma migrate dev

# 填充测试数据
npm run db:seed

# 启动开发服务器
npm run dev

# 打开 http://localhost:3000/login
# 使用 admin/admin123 登录
```

---

## 关键文件路径

| 文件 | 说明 |
|------|------|
| `prisma/schema.prisma` | 数据库模型定义 |
| `prisma/migrations/` | 数据库迁移事实 |
| `prisma/seed.ts` | 开发/演示数据种子 |
| `src/auth/index.ts` | NextAuth 配置 |
| `src/lib/prisma.ts` | Prisma Client 单例 |
| `src/types/index.ts` | 常量定义（状态、优先级等） |
| `src/app/(dashboard)/` | 所有需要登录的页面 |
| `AGENTS.md` | AI agent 与 worktree 工作流主入口 |
| `docs/repo-hygiene-matrix.md` | 脏状态分类与治理策略 |
| `docs/worktree-branch-audit.md` | Worktree/分支清理审计 |
| `docs/prisma-dev-db-governance.md` | 本地 SQLite DB 治理策略 |
| `docs/cloud-readiness-boundary.md` | 上云前环境、存储、数据库和部署平台边界 |
| `docs/ai-mvp-technical-brief.md` | AI MVP 轻量实现、人工确认、知识来源、Deepseek 接入和 MS6/MS7 拆分边界 |

---

## 继续开发的建议

1. **使用 worktree 工作流**：
   ```bash
   git fetch origin
   git worktree add .worktrees/feature-xxx -b feature/xxx develop
   cd .worktrees/feature-xxx
   # 开发完成后合并回 develop
   ```

2. **接下来的 Phase**：
   - Phase 6-8 已全部完成（协作者功能、附件上传、通知系统）
   - Phase 9 质量治理、M3 API route handler 集成测试、M4 项目整洁度与 AI 适配治理、MS5 GitHub CI 与上云前决策基线均已验收
   - MS6 AI 需求生成 Discussion MVP 已激活并进入准备工作；MS7 管理员项目知识库管理与导入已注册为 planned

3. **数据库变更**：修改 `prisma/schema.prisma` 后运行：
   ```bash
   npx prisma migrate dev --name <migration_name>
   ```

