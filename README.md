# ReqFlow

轻量级内部工单需求协作系统，为团队提供高效的工单管理、协作者管理和通知提醒能力。

## 功能特性

- **工单管理** — 创建、编辑、状态流转与多条件筛选，覆盖工单全生命周期
- **协作者管理** — 添加/移除协作者、角色变更，灵活控制协作权限
- **附件上传** — 支持拖拽上传与图片预览，方便需求信息补充
- **通知系统** — 站内通知与铃铛实时提醒，不再遗漏关键更新
- **操作日志** — 完整审计追踪，每一次变更都有据可查
- **管理员知识库** — 管理多知识库、上传文档或 zip、解析片段、启停来源与片段
- **AI 需求草稿** — 基于选定知识库的 hybrid retrieval 上下文生成结构化草稿，保留人工确认边界
- **检索证据调试** — 管理员可检查 lexical/vector/fusion/context-window/citation evidence

## 技术栈

| 类别     | 技术          |
| -------- | ------------- |
| 框架     | Next.js 16    |
| UI 库    | React 19      |
| 语言     | TypeScript 5  |
| 样式     | TailwindCSS 4 |
| ORM      | Prisma 5      |
| 数据库   | PostgreSQL    |
| 认证     | NextAuth v5   |
| 组件库   | Radix UI      |
| 图标     | Lucide React  |
| 检索     | PostgreSQL native FTS fallback + pgvector + RRF-style fusion |
| AI       | Server-side provider adapter; current provider decision is Deepseek |

## 快速启动

```bash
# 安装依赖
npm install

# 初始化数据库
docker compose -f docker-compose.postgres.yml up -d postgres
npm run postgres:wait
npx prisma migrate deploy --schema prisma/schema.prisma

# 填充测试数据
npm run db:seed

# 启动开发服务器
npm run dev
```

启动后访问 http://localhost:3000/login

## Docker Runtime Bundle

MS-13 adds a local Docker Compose runtime bundle for product inspection:

```bash
AUTH_SECRET="replace-with-a-local-secret" docker compose -f docker-compose.runtime.yml up -d --build postgres web
RUNTIME_POSTGRES_PORT="5432" RUNTIME_WEB_URL="http://127.0.0.1:3000/login" RUNTIME_RUN_SEED=true npm run runtime:smoke
```

The runtime bundle keeps migrations, seed, smoke checks, and optional embedding
probing as explicit operator actions. It does not delete volumes, uploads,
model cache, or database state. The default search runtime is PostgreSQL native
FTS fallback plus pgvector; BM25 remains target-runtime research until a future
image proves a supported extension.

Full runbook: `docs/ms13-runtime-operator-runbook.md`.

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
| `npm run postgres:readiness` | 检查 Prisma PostgreSQL schema/migration readiness |
| `npm run search:extensions` | 检查 pgvector、native FTS fallback 和 pg_search 边界 |
| `npm run retrieval:evaluate` | 运行中文 hybrid retrieval 质量 gate |
| `npm run embedding:probe` | 手动探测可选本地 embedding sidecar 的维度和延迟 |
| `npm run runtime:smoke` | 验证 Docker runtime bundle 的 migrate/readiness/web smoke |
| `npx prisma studio`  | 数据库管理界面   |

## 注意事项

- 需要 Node.js 18+ 环境
- PostgreSQL 是当前 Prisma datasource provider；本地开发可使用 `docker-compose.postgres.yml`
- 上传文件存储在 `public/uploads/` 目录
- API route 集成测试使用隔离 PostgreSQL schema，并由测试 helper 清理
- 上云前环境变量、PostgreSQL、上传存储和部署平台边界见 `docs/cloud-readiness-boundary.md`
- AI/operator 当前事实见 `docs/operator-hybrid-search-ai-draft.md`；MS6 早期边界文档仍保留为历史设计记录
- Hybrid search 当前使用 PostgreSQL native FTS fallback、pgvector 和 RRF-style fusion；`pg_search` 仍是可选目标，只有目标环境 readiness 通过后才可宣称 BM25 路径
- AI 草稿只能通过 Context Window Builder 使用经过过滤和裁剪的知识上下文；引用来自真实检索命中，最终创建工单仍需用户在现有表单中确认
- 本地 CPU embedding sidecar 是可选 PoC，见 `docs/local-embedding-sidecar-poc.md`；默认路径不会下载模型或把模型权重打入主应用镜像
- Docker runtime bundle 见 `docs/ms13-runtime-operator-runbook.md`；标准流程只使用显式 start/smoke/stop，不自动删除 volume、uploads 或模型缓存
- 代码改动必须在 Git worktree 中完成，详见 `AGENTS.md`
- AI 协作入口以 `AGENTS.md` 为准，辅助说明见 `docs/ai-collaboration-entrypoints.md`
- Repo hygiene、本地 DB 治理、worktree 中 Prisma 依赖初始化说明见 `docs/repo-hygiene-matrix.md`、`docs/worktree-branch-audit.md` 和 `docs/prisma-dev-db-governance.md`
