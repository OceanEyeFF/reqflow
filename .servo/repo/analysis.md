# RepoScope Analysis

## Metadata

- updated: 2026-05-26
- based_on_snapshot: .servo/repo/snapshot-status.md

## Current State Summary

Phase 1-8 全部完成并合并到 `develop`。Phase 9 的基本面、分模块治理与 M3 API route handler 集成测试已完成并由用户验收。

当前活跃 milestone 是 `MS-20260524-001 / 项目整洁度与 AI 适配治理`。截至 baseline `f5851cff7f1395c1b5319d153656b311a5996350`，M4 已完成 6/7 个 worktrack：
- WT-20260524-018: dirty-state strategy matrix
- WT-20260524-019: `.gitignore` temp artifact governance
- WT-20260524-020: worktree/branch cleanup
- WT-20260524-021: AI collaboration entrypoints
- WT-20260524-022: Prisma dev DB governance
- WT-20260524-023: docs and RepoStatus synchronization

最近质量基线来自 WT-20260524-022：
- `npm run build` 通过
- `npm run lint` 通过，ESLint 0 warning
- `npm run test` 通过，10 个测试文件，71 个测试

## Principal Contradictions

1. **M4 已执行清理 vs 未最终验收**: repo hygiene 的主要决策已落地，但仍需 WT-024 最终 CodeReview 和 programmer final acceptance。
2. **可见未跟踪目录 vs 不可批量处理**: `.agents/.claude/.harness/.mavis/.worktrees` 等仍可见，但已被分类为需要逐项判断的治理对象，不应通过粗暴 ignore 或删除制造表面 clean。
3. **本地 SQLite 便利性 vs 生产部署要求**: 开发 DB 已改为 local-only runtime artifact；生产数据库迁移和云端环境变量仍需独立部署 worktrack 处理。
4. **远端发布意图 vs 当前未推送**: `develop` 领先 `origin/develop`，GitHub 是主要远端与 CI 位置；Gitee 已由用户降级为非当前重点。

## Priority Assessment

| 优先级 | 事项 | 理由 |
|--------|------|------|
| P0 | 完成 WT-20260524-024 最终 CodeReview | M4 completion signal 7 和 milestone handback 前置条件 |
| P1 | GitHub push + CI 验证 | 用户已指定 GitHub 为主要推送端和 CI/CD 位置 |
| P1 | 云端部署数据库与环境变量方案 | 当前 SQLite/local-only DB 策略不等于生产数据库方案 |
| P2 | 页面级交互回归测试 | 工单列表、详情、新建流程仍缺黑盒覆盖 |
| P3 | 邮件/外部通知能力 | 当前仅有站内通知 |

## Route Projection

已验收 milestone：
1. **M3: API route handler 集成测试** — 为 tickets、comments、members、attachments、notifications 的关键成功/失败路径建立 Prisma/SQLite 测试夹具与 route handler 覆盖

当前 active milestone：
1. **M4: 项目整洁度与 AI 适配治理** — active, 6/7 completed

建议按以下 worktrack 顺序推进：
1. WT-20260524-024: M4 最终 CodeReview Worktrack — current
3. Milestone Gate — 聚合 WT-018 至 WT-024 证据后 handback，等待 programmer final acceptance

## Unknowns / Next Options

- `docs/phase6-8-plan.md`、`.harness/`、`.mavis/` 等未跟踪治理候选是否应迁入 canonical docs/control plane、归档、保留本地或删除，需要在 M4 final review 后由用户或后续 worktrack 决定。
- 云端部署若推进，需要单独定义数据库、环境变量、GitHub Actions、托管平台与 secret 管理边界。
- 页面级回归测试是否引入 Playwright，还是先保持 Vitest 单元/集成测试，仍是后续质量路线选择。
