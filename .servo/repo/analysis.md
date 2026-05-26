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

当前 active milestone 是 `MS-20260526-001 / GitHub CI 与上云前决策基线`，0/6 completed。当前用户只授权推进 `WT-20260526-025 / RepoStatus 刷新`，完成后必须停止并 handoff。

当前 planned milestone 是 `MS-20260526-002 / AI 需求说明优化 MVP`，依赖 MS5 完成。

最近质量基线来自 WT-20260524-024：
- `npm run build` 通过
- `npm run lint` 通过，ESLint 0 warning
- `npm run test` 通过，10 个测试文件，71 个测试

## Principal Contradictions

1. **MS5 已激活 vs RepoStatus 滞后**: pipeline 已注册 MS5/MS6，但 RepoStatus 仍部分描述 M4 handback 状态；WT-025 的职责是清除这一滞后。
2. **可见未跟踪目录 vs 不可批量处理**: `.agents/.claude/.harness/.mavis/.worktrees` 等仍可见，但已被分类为需要逐项判断的治理对象，不应通过粗暴 ignore 或删除制造表面 clean。
3. **本地 SQLite 便利性 vs 生产部署要求**: 开发 DB 已改为 local-only runtime artifact；生产数据库迁移和云端环境变量仍需独立部署 worktrack 处理。
4. **远端发布意图 vs 当前未推送**: `develop` 领先 `origin/develop`，GitHub 是主要远端与 CI 位置；Gitee 已由用户降级为非当前重点。
5. **AI 需求已确认 vs 基础设施边界未落文档**: MS6 目标已 planned，但 MS5 仍需先写清 AI MVP 技术决策 Brief，明确不依赖 PostgreSQL/pgvector。

## Priority Assessment

| 优先级 | 事项 | 理由 |
|--------|------|------|
| P0 | WT-20260526-025 RepoStatus 刷新 | 当前用户只授权本 worktrack；它是 MS5 后续 CI/远端验证前置 |
| P0 | GitHub Actions CI 基线 | MS5 的第一个实现性质量门，WT-025 后的下一项 |
| P0 | GitHub push + CI 验证 | 用户已指定 GitHub 为主要推送端和 CI/CD 位置 |
| P0 | 上云前环境与部署边界 | 当前 SQLite/local-only DB 策略不等于生产部署方案，但 PG 暂不碰 |
| P0 | AI MVP 技术决策 Brief | MS6 前置，必须明确无 PG 依赖、人工确认和知识库边界 |
| P2 | 页面级交互回归测试 | 工单列表、详情、新建流程仍缺黑盒覆盖 |
| P3 | 邮件/外部通知能力 | 当前仅有站内通知 |

## Route Projection

已验收 milestone：
1. **M3: API route handler 集成测试** — 为 tickets、comments、members、attachments、notifications 的关键成功/失败路径建立 Prisma/SQLite 测试夹具与 route handler 覆盖

已验收 milestone：
1. **M4: 项目整洁度与 AI 适配治理** — completed, 7/7 completed, milestone gate pass, accepted by programmer

当前 active milestone：
1. **MS5: GitHub CI 与上云前决策基线** — active, 0/6 completed

建议按以下 worktrack 顺序推进：
1. WT-20260526-025: RepoStatus 刷新 — current authorized worktrack
2. STOP / handoff — user explicitly did not grant permission to continue into WT-026 this turn
3. WT-20260526-026: GitHub Actions CI 基线 — next only after new user permission

## Unknowns / Next Options

- `docs/phase6-8-plan.md`、`.harness/`、`.mavis/` 等未跟踪治理候选是否应迁入 canonical docs/control plane、归档、保留本地或删除，需要在 M4 final review 后由用户或后续 worktrack 决定。
- 云端部署若推进，需要单独定义数据库、环境变量、GitHub Actions、托管平台与 secret 管理边界；PostgreSQL/pgvector 暂不碰。
- 页面级回归测试是否引入 Playwright，还是先保持 Vitest 单元/集成测试，仍是后续质量路线选择。
