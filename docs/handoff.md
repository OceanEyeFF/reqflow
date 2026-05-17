# ReqFlow 项目交接文档

## 项目概览

**项目名称**: ReqFlow - 轻量级公司内部工单需求协作系统
**仓库路径**: `E:\repos\personal\reqflow`
**当前分支**: `develop`
**技术栈**: Next.js 16 + TypeScript + TailwindCSS + Prisma 5 + SQLite + NextAuth

---

## 已完成的工作

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

**测试账号**:
| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| manager | manager123 | 项目经理 |
| user | user123 | 普通用户 |

---

## 待完成的工作（按优先级）

### 高优先级
1. **附件上传功能** - Phase 7
2. **通知系统** - Phase 8（站内通知 / 邮件通知）
3. **移动端适配** - 响应式优化

### 中优先级
4. **用户管理页面** - 管理员可见的用户 CRUD
5. **工单标签功能** - 给工单打标签分类
6. **工单搜索** - 全文搜索

### 低优先级（未来扩展）
7. **统计报表** - 工单完成率、平均处理时间等
8. **飞书/钉钉集成** - 消息推送
9. **数据库迁移** - 从 SQLite 迁移到 PostgreSQL

---

## 启动项目

```bash
# 在项目根目录（已切换到 develop）
cd E:\repos\personal\reqflow

# 安装依赖
npm install

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
| `prisma/dev.db` | SQLite 数据库文件 |
| `src/auth/index.ts` | NextAuth 配置 |
| `src/lib/prisma.ts` | Prisma Client 单例 |
| `src/types/index.ts` | 常量定义（状态、优先级等） |
| `src/app/(dashboard)/` | 所有需要登录的页面 |

---

## 继续开发的建议

1. **使用 worktree 工作流**：
   ```bash
   git fetch origin
   git worktree add .worktrees/feature-xxx -b feature/xxx origin/develop
   cd .worktrees/feature-xxx
   # 开发完成后合并回 develop
   ```

2. **接下来的 Phase**：
   - Phase 6: 协作者功能（已实现后端，前端可完善）
   - Phase 7: 附件上传（需要增加文件存储）
   - Phase 8: 通知系统

3. **数据库变更**：修改 `prisma/schema.prisma` 后运行：
   ```bash
   npx prisma migrate dev --name <migration_name>
   ```

---

## 已知问题 / 注意事项

1. **TailwindCSS v4**: 当前使用 TailwindCSS v4，有一些破坏性变更（如 `@apply border-border` 需要改成直接写 CSS 变量）
2. **NextAuth v5**: 使用 beta 版本，API 有变化，需要关注官方更新
3. **Prisma v5**: 已从 v7 回退到 v5，以获得更好的稳定性
4. **SQLite 限制**: SQLite 不适合生产环境并发写入，后续考虑迁移到 PostgreSQL

---

*交接时间: 2026-05-17 10:05 (UTC+8)*
*交接人: Mavis (mavis team orchestrator)*