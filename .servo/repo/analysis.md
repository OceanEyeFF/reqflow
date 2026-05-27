# RepoScope Analysis

## Metadata

- updated: 2026-05-27
- based_on_snapshot: .servo/repo/snapshot-status.md
- baseline_branch: develop
- baseline_commit: b93935da269ed14ce85c28c799d0f4dd7cd9361c

## Current State Summary

Phase 1-8 全部完成并合并到 `develop`。Phase 9 的项目基本面更新、分模块代码质量治理、API route handler 集成测试、项目整洁度与 AI 适配治理、GitHub CI 与上云前决策基线，以及 AI 需求生成 Discussion MVP 均已完成对应 milestone 验收。

最近完成的 milestone 是 `MS-20260526-002 / AI 需求生成 Discussion MVP`。截至 baseline `b93935da269ed14ce85c28c799d0f4dd7cd9361c`，MS6 已完成 8/8 个 worktrack，通过 Milestone Gate、补充 CodeReview 和专家评议，并由 programmer 最终验收：
- WT-20260526-031: Discussion 产品流与信息架构设计
- WT-20260526-032: 最小内置知识语料与引用策略
- WT-20260526-033: Deepseek Draft API 与 Provider Adapter
- WT-20260526-034: AI 需求生成 Discussion 页面 UI
- WT-20260526-035: 草稿确认与工单表单衔接
- WT-20260526-036: 安全治理、测试与 MS6 验收
- WT-20260527-046: MS6 CodeReview 专用评审
- WT-20260527-047: MS6 专家评议评估

当前没有 active milestone。Pipeline 中唯一 planned milestone 是 `MS-20260527-001 / 管理员项目知识库管理与导入`，依赖 `MS-20260526-002`，该依赖已满足。MS7 包含 7 个 planned worktrack，按当前 backlog 顺序为：
- WT-20260527-039: 管理员知识库上传产品与权限设计
- WT-20260527-045: 管理员 AI Provider 配置
- WT-20260527-040: 文档/zip 上传安全与私有存储
- WT-20260527-041: 文档解析、分块、来源/版本记录
- WT-20260527-042: 轻量检索与引用片段选择
- WT-20260527-043: 管理员知识库 UI
- WT-20260527-044: 知识库导入验收与安全回归

最近质量基线：
- `npm run lint`、`npm run test`、`npm run build` 在 MS6 validation/review 轮次通过；WT-047 fresh validation 记录包含 `npm ci`、`git diff --check`、`npm run lint`、`npm run test`（15 files / 104 tests）和 `npm run build`。
- GitHub Actions run `26502063963` 对 MS6 validation handback commit `b5d50b8b8043dc8a35264cf96553955a4697ba8d` completed with conclusion `success`。
- `develop` 当前基准为 `b93935da269ed14ce85c28c799d0f4dd7cd9361c`，merge message 为 `merge: accept MS6 milestone`。

## Principal Contradictions

1. **MS7 activation readiness vs programmer review boundary**: MS6 已验收且 MS7 依赖满足，但 MS7 仍处于 planned。下一步应由 RepoScope 判定激活 MS7，不应绕过 programmer review boundary 直接打开 feature worktrack。
2. **AI provider configuration vs secret safety**: MS7 已包含管理员可配置 OpenAI-compatible endpoint/model/key 和 localhost no-key 模式；实现时必须保持 secret 仅服务端可读、响应只返回脱敏状态，并避免空 key 被误解释为云端 provider 配置。
3. **Knowledge import MVP vs storage/retrieval expansion**: MS7 允许私有上传、解析、分块、轻量检索和引用追踪；PDF/DOCX/OCR、生产对象存储、PostgreSQL/pgvector 和第三方向量服务仍在默认范围外。
4. **可见未跟踪目录 vs 不可批量处理**: `.agents/.claude/.harness/.mavis/.worktrees` 等仍可见，但已被分类为需要逐项判断的治理对象，不应通过粗暴 ignore 或删除制造表面 clean。

## Priority Assessment

| 优先级 | 事项 | 理由 |
|--------|------|------|
| P0 | MS7 activation decision | 当前无 active milestone，唯一 planned milestone 的依赖已满足，下一步应先激活 MS7 或明确保持观察。 |
| P1 | WT-20260527-039 intake | 管理员知识库上传产品与权限设计是 MS7 的第一个 planned worktrack，可为上传、安全、版本和 UI 划定边界。 |
| P1 | WT-20260527-045 intake | 用户明确追加管理员 AI Provider 配置；可在 MS7 内作为 provider/secret 边界的早期执行切片。 |
| P2 | 上云前环境与部署执行 | 当前 SQLite/local-only DB 策略不等于生产部署方案，但 PostgreSQL/pgvector 暂不碰。 |
| P3 | 页面级交互回归测试 | 工单列表、详情、新建流程仍缺黑盒覆盖，可在 MS7 后续或独立质量 milestone 中处理。 |

## Route Projection

已验收 milestone：
1. **M3: API route handler 集成测试** — completed, accepted
2. **M4: 项目整洁度与 AI 适配治理** — completed, accepted
3. **MS5: GitHub CI 与上云前决策基线** — completed, accepted
4. **MS6: AI 需求生成 Discussion MVP** — completed, accepted at `b93935da269ed14ce85c28c799d0f4dd7cd9361c`

当前 active milestone：
1. none

planned milestone：
1. **MS7: 管理员项目知识库管理与导入** — planned, 0/7 completed, depends on accepted MS6

建议下一步：
1. RepoScope.Decide / Milestone-First: activate `MS-20260527-001` if programmer review boundary permits.
2. After activation, initialize the first ready worktrack from MS7 backlog. Default first slice remains `WT-20260527-039` unless programmer chooses to prioritize the explicitly appended `WT-20260527-045` provider configuration first.

## Unknowns / Next Options

- MS7 first worktrack ordering may need programmer choice if provider configuration (`WT-20260527-045`) should precede product/upload design (`WT-20260527-039`).
- AI Provider 配置的持久化方式、API key 加密/脱敏策略、localhost endpoint allowlist、测试连接语义和默认模型策略若超出 MVP 安全边界，需要用户确认。
- 文档/zip 上传的文件类型、大小上限、存储位置和删除策略若超出 MVP 安全边界，需要用户确认。
- `docs/phase6-8-plan.md`、`.harness/`、`.mavis/` 等未跟踪治理候选是否应迁入 canonical docs/control plane、归档、保留本地或删除，仍需后续治理判断。
