# ReqFlow

轻量级内部工单需求协作系统，为团队提供高效的工单管理、协作者管理和通知提醒能力。

## 功能特性

- **工单管理** — 创建、编辑、状态流转与多条件筛选，覆盖工单全生命周期
- **协作者管理** — 添加/移除协作者、角色变更，灵活控制协作权限
- **附件上传** — 支持拖拽上传与图片预览，方便需求信息补充
- **通知系统** — 站内通知与铃铛实时提醒，不再遗漏关键更新
- **操作日志** — 完整审计追踪，每一次变更都有据可查

## 技术栈

| 类别     | 技术          |
| -------- | ------------- |
| 框架     | Next.js 16    |
| UI 库    | React 19      |
| 语言     | TypeScript 5  |
| 样式     | TailwindCSS 4 |
| ORM      | Prisma 5      |
| 数据库   | SQLite        |
| 认证     | NextAuth v5   |
| 组件库   | Radix UI      |
| 图标     | Lucide React  |

## 快速启动

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma migrate dev

# 填充测试数据
npm run db:seed

# 启动开发服务器
npm run dev
```

启动后访问 http://localhost:3000/login

## 测试账号

| 用户名  | 密码       | 角色     |
| ------- | ---------- | -------- |
| admin   | admin123   | 管理员   |
| manager | manager123 | 项目经理 |
| user    | user123    | 普通用户 |

## 项目结构

```
reqflow/
├── prisma/            # 数据库模型与种子数据
├── src/
│   ├── app/
│   │   ├── api/       # REST API 路由
│   │   ├── (dashboard)/ # 工作台页面
│   │   └── login/     # 登录页
│   ├── auth/          # NextAuth 配置
│   ├── components/    # UI 组件
│   ├── hooks/         # React Hooks
│   ├── lib/           # 工具库 (Prisma Client 等)
│   └── types/         # TypeScript 类型
├── public/uploads/    # 附件存储
└── docs/              # 项目文档
```

## 可用脚本

| 命令                 | 说明             |
| -------------------- | ---------------- |
| `npm run dev`        | 启动开发服务器   |
| `npm run build`      | 生产构建         |
| `npm run lint`       | 代码检查         |
| `npm run test`       | 运行 Vitest 单元/集成测试 |
| `npm run db:seed`    | 填充测试数据     |
| `npx prisma studio`  | 数据库管理界面   |

## 注意事项

- 需要 Node.js 18+ 环境
- 本地 SQLite 数据库是运行时产物，不纳入 Git；使用 Prisma migration 和 seed 重建开发数据
- 上传文件存储在 `public/uploads/` 目录
- API route 集成测试使用隔离 SQLite 数据库，测试数据文件位于 `prisma/test-dbs/` 并由测试清理
- 代码改动必须在 Git worktree 中完成，详见 `AGENTS.md`
- AI 协作入口以 `AGENTS.md` 为准，辅助说明见 `docs/ai-collaboration-entrypoints.md`
- Repo hygiene 与本地 DB 治理说明见 `docs/repo-hygiene-matrix.md`、`docs/worktree-branch-audit.md` 和 `docs/prisma-dev-db-governance.md`
