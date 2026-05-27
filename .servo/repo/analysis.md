# RepoScope Analysis

## Metadata

- updated: 2026-05-27
- based_on_snapshot: .servo/repo/snapshot-status.md

## Current State Summary

Phase 1-8 全部完成并合并到 `develop`。Phase 9 的基本面、分模块治理与 M3 API route handler 集成测试已完成并由用户验收。

最近完成的 milestone 是 `MS-20260524-001 / 项目整洁度与 AI 适配治理`。截至 baseline `87903be9dcd65c1769040a54b214e93303014851`，M4 已完成 7/7 个 worktrack，通过 Milestone Gate，并由 programmer 最终验收：
- WT-20260524-018: dirty-state strategy matrix
- WT-20260524-019: `.gitignore` temp artifact governance
- WT-20260524-020: worktree/branch cleanup
- WT-20260524-021: AI collaboration entrypoints
- WT-20260524-022: Prisma dev DB governance
- WT-20260524-023: docs and RepoStatus synchronization
- WT-20260524-024: final governance review

最近完成的 milestone 是 `MS-20260526-001 / GitHub CI 与上云前决策基线`。截至 baseline `e127633d2982ee01605a0316dabbaf990382aca3`，MS5 已完成 8/8 个 worktrack，通过 Milestone Gate，并由 programmer 最终验收：
- WT-20260526-025: RepoStatus 刷新
- WT-20260526-026: GitHub Actions CI 基线
- WT-20260526-027: GitHub 推送与 CI 验证
- WT-20260526-028: 上云前环境与部署边界文档
- WT-20260526-029: AI MVP 技术决策 Brief
- WT-20260526-030: MS5 最终验收
- WT-20260526-037: 严谨 CodeReview Worktrack
- WT-20260526-038: Ticket 授权与上传安全加固

当前 active milestone 是 `MS-20260526-002 / AI 需求生成 Discussion MVP`，依赖 MS5 完成，目前 0/6 completed。用户已确认 AI provider 使用 Deepseek，并确认管理员知识库上传/docs zip 导入拆分为 `MS-20260527-001 / 管理员项目知识库管理与导入`。

最近质量基线来自 WT-20260526-026：
- `npm run build` 通过
- `npm run lint` 通过，ESLint 0 warning
- `npm run test` 通过，10 个测试文件，83 个测试
- GitHub Actions baseline workflow 已建立，覆盖 `npm ci`、`npm run lint`、`npm run test`、`npm run build`
- GitHub Actions run `26494518202` 对 `bd2789d4e404996b603833757dfa71859d2b0210` 通过，job `78019430374 / lint, test, build` conclusion `success`
- GitHub Actions run `26494818503` 对 handback docs merge commit `a2fddc64b39e0f4ecb09d0ffee8587c27ce153d0` 通过，job `78020426471 / lint, test, build` conclusion `success`
- `docs/cloud-readiness-boundary.md` 已建立上云前边界，覆盖 `.env`、`AUTH_SECRET`、`DATABASE_URL`、上传目录、SQLite 生产风险和部署平台能力边界
- `docs/ai-mvp-technical-brief.md` 已建立 AI MVP 技术边界，并在本轮 planning 中调整为 Deepseek provider、discussion 页面主入口、MS7 知识库导入拆分和无 PostgreSQL/pgvector 依赖
- GitHub Actions run `26464643535` 是 WT-030 旧远端 CI 证据，已被当前 run `26494518202` supersede
- `docs/ms5-final-review.md` 已刷新最终 review 记录，结论为 WT-037 发现的阻断项已由 WT-038 修复，MS5 evidence ready for programmer acceptance decision

## Principal Contradictions

1. **MS6 discussion MVP vs MS7 knowledge-base import**: MS6 已收窄为 Deepseek-backed discussion MVP；管理员知识库上传、docs zip 导入、解析、版本和管理 UI 已拆入 MS7，不能在 MS6 静默扩大范围。
2. **可见未跟踪目录 vs 不可批量处理**: `.agents/.claude/.harness/.mavis/.worktrees` 等仍可见，但已被分类为需要逐项判断的治理对象，不应通过粗暴 ignore 或删除制造表面 clean。
3. **本地 SQLite 便利性 vs 生产部署要求**: 开发 DB 已改为 local-only runtime artifact；生产数据库迁移和云端环境变量仍需独立部署 worktrack 处理。
4. **远端主线已同步 vs 生产部署要求未定义**: GitHub 已同步，Gitee 已由用户降级为非当前重点；生产部署仍需要环境变量、存储和数据库边界。
5. **Deepseek provider 已确认 vs secret/计费仍需上线前决策**: MS6 可以设计 provider adapter，但真实 API key、模型、计费、生产 secret 和上线配置仍需用户或部署 worktrack 决策。

## Priority Assessment

| 优先级 | 事项 | 理由 |
|--------|------|------|
| P0 | WT-20260526-031 intake | MS6 已激活并进入准备工作，下一步应先做 discussion 产品流与信息架构设计，不直接实现 API/UI |
| P1 | 上云前环境与部署执行 | 当前 SQLite/local-only DB 策略不等于生产部署方案，但 PG 暂不碰 |
| P2 | 页面级交互回归测试 | 工单列表、详情、新建流程仍缺黑盒覆盖 |
| P3 | 邮件/外部通知能力 | 当前仅有站内通知 |

## Route Projection

已验收 milestone：
1. **M3: API route handler 集成测试** — 为 tickets、comments、members、attachments、notifications 的关键成功/失败路径建立 Prisma/SQLite 测试夹具与 route handler 覆盖

已验收 milestone：
1. **M4: 项目整洁度与 AI 适配治理** — completed, 7/7 completed, milestone gate pass, accepted by programmer

当前 active milestone：
1. **MS6: AI 需求生成 Discussion MVP** — active, 0/6 completed, depends on accepted MS5

planned milestone：
1. **MS7: 管理员项目知识库管理与导入** — planned, 0/6 completed, depends on MS6

建议按以下 worktrack 顺序推进：
1. Preparation / WT-20260526-031 intake: Discussion 产品流与信息架构设计。

## Unknowns / Next Options

- `docs/phase6-8-plan.md`、`.harness/`、`.mavis/` 等未跟踪治理候选是否应迁入 canonical docs/control plane、归档、保留本地或删除，需要在 M4 final review 后由用户或后续 worktrack 决定。
- 云端部署若推进，需要单独定义数据库、环境变量、GitHub Actions、托管平台与 secret 管理边界；PostgreSQL/pgvector 暂不碰。
- 页面级回归测试是否引入 Playwright，还是先保持 Vitest 单元/集成测试，仍是后续质量路线选择。
