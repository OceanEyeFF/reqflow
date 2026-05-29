# RepoScope Analysis

## Metadata

- updated: 2026-05-29
- based_on_snapshot: .servo/repo/snapshot-status.md
- baseline_branch: develop
- baseline_commit: 629f7c7232e425d08484877593222cbeaec2ec1f

## Current State Summary

Phase 1-8 已完成并合并到 `develop`。当前代码仓库基准是 `629f7c7232e425d08484877593222cbeaec2ec1f` (`Merge MS8 addendum final acceptance`)。RepoScope 处于 active，WorktrackScope 处于 closed，没有 active milestone 或 active worktrack。

最近完成并验收的 milestone 是 `MS-20260528-003 / MS8 addendum`。截至当前基准，MS8 addendum 已完成 7/7 个 worktrack，并由 fdch0 在 2026-05-29 最终验收：

- WT-20260528-064: 知识库编辑与禁用归档
- WT-20260528-065: AI 多方向追问策略
- WT-20260528-066: MS8 addendum 集成验收
- WT-20260528-067: 管理员创建知识库入口补缺
- WT-20260529-068: docs-codewiki zip 混入文件兼容
- WT-20260529-069: AI 追问逐题回答与草稿优先级修复
- WT-20260529-077: AI 追问可见性与空追问兜底修复

MS7 已验收后的文档补强 `WT-20260528-061 / Prisma worktree 依赖流程文档` 也已合并，MS7 artifact 与 backlog 已补齐为 12/12 completed。

当前 pipeline 共有 11 个 milestone：9 个 completed、2 个 planned、0 个 active、0 个 superseded。planned milestone 为：

- `MS-20260528-002 / docs 文档更新迭代与整理`: planned，1 个 worktrack，依赖 MS-20260528-001，依赖已满足。
- `MS-20260529-001 / 中文知识检索增强与结构化索引`: planned，7 个 worktrack，依赖 MS-20260528-001，建议在 MS8 addendum final acceptance handback 后执行，前置条件已满足。

## Principal Contradictions

1. **文档追平 vs 检索增强优先级**: MS-20260528-002 负责把 MS6/MS7/MS8、Prisma、AI Provider、知识库导入和验收文档追平到实现事实；MS-20260529-001 负责解决中文知识召回质量问题。两者前置条件都已满足，但当前只能激活一个 milestone。
2. **已验收功能面 vs 操作文档滞后**: 代码和 `.servo` 事实已经覆盖管理员知识库、多知识库选择、AI 语言/多草稿、禁用归档、追问兜底等能力；`docs/` 仍有集中整理 milestone 未执行，继续扩展功能会扩大文档追平差距。
3. **轻量检索边界 vs 中文召回质量**: MS-20260529-001 明确不默认引入 PostgreSQL、pgvector、外部向量数据库或常驻检索服务；如果评测显示轻量增强不足，必须先产出架构评估，而不是在实现中静默升级技术栈。
4. **本地 control plane 已刷新 vs 远端基线未确认**: 当前本地 `develop` 领先 `origin/develop`。历史 GitHub Actions CI 有通过记录，但当前 `629f7c7` 是否推送并刷新远端 CI 仍是后续 RepoScope 决策项。
5. **脏状态治理仍开放**: 主 checkout 仍有 `.agents/`, `.claude/`, `.harness/`, `.local-backup/`, `.logs/`, `.mavis/`, `.worktrees/`, zip 样本和 `docs/phase6-8-plan.md` 等未跟踪项；这些已被治理文档标记为需要逐项判断，不应批量删除或简单 ignore。

## Priority Assessment

| Priority | Item | Reason |
|----------|------|--------|
| P0 | RepoScope decide next active milestone | 当前无 active milestone；MS-20260528-002 和 MS-20260529-001 均 ready，需要明确激活顺序。 |
| P1 | MS-20260528-002 / WT-20260528-060 | 文档追平能降低后续开发误用旧 MS6/MS7/MS8 上下文的风险，尤其是 Prisma worktree、AI Provider、知识库导入与验收流程。 |
| P1 | MS-20260529-001 / WT-20260529-070 | 如果用户当前痛点是中文知识召回，先建立诊断与评测语料能把后续检索增强限定在可验证范围内。 |
| P2 | Remote CI / push decision | 当前本地 `develop` ahead of `origin/develop`；若要进入远端验收，应先推送并观察 CI。 |
| P3 | Dirty-state governance follow-up | 未跟踪目录和样本文件需要逐项分类，但不应阻塞已计划 milestone 的正常激活。 |

## Route Projection

Completed milestones:

1. MS-20260523-001: 项目基本面更新
2. MS-20260523-002: 分模块代码质量治理
3. MS-20260523-003: API route handler 集成测试
4. MS-20260524-001: 项目整洁度与 AI 适配治理
5. MS-20260526-001: GitHub CI 与上云前决策基线
6. MS-20260526-002: AI 需求生成 Discussion MVP
7. MS-20260527-001: 管理员项目知识库管理与导入
8. MS-20260528-001: 知识库文件夹化管理与模块化 AI 草稿范围
9. MS-20260528-003: MS8 addendum

Active milestone:

- none

Planned milestones:

1. MS-20260528-002: docs 文档更新迭代与整理, 0/1 completed, next worktrack WT-20260528-060.
2. MS-20260529-001: 中文知识检索增强与结构化索引, 0/7 completed, next worktrack WT-20260529-070.

Recommended next route:

1. If the objective is control/information surface accuracy before more feature work, activate `MS-20260528-002` and initialize `WT-20260528-060`.
2. If the objective is to address the latest product-quality pain around Chinese retrieval, activate `MS-20260529-001` and initialize `WT-20260529-070`.
3. In either route, keep PostgreSQL/pgvector/vector-service upgrades outside the default scope unless fdch0 explicitly approves a technology escalation.

## Observation Readiness

- snapshot_freshness: refreshed to current local `develop` HEAD `629f7c7232e425d08484877593222cbeaec2ec1f`.
- goal_node_map_status: present; node type registry includes feature/refactor/bugfix/test/docs. Governance node exists historically for WT-20260528-063 but is not in the current charter registry; use only if a future control-plane change explicitly needs it.
- milestone_pipeline_stale: no; backlog summary and planned/completed milestone counts are aligned.
- worktrack_backlog_stale: no after this refresh; WT-061, WT-069, WT-077, and WT-070..076 are registered.
- code_validation_status: no new code change in this refresh; latest implementation validation remains WT-20260529-077 (`npm run lint`, `npm run test` 28 files / 201 tests, build pass).
- handback_required: no, unless fdch0 must choose between planned milestone activation paths.

## Unknowns / Next Options

- Whether fdch0 wants docs cleanup before Chinese retrieval work, or prefers to start retrieval diagnosis immediately.
- Whether current local `develop` should be pushed to GitHub and CI refreshed before the next milestone starts.
- Whether `MS-20260529-001` should remain lightweight-only through all seven planned worktracks, or introduce an explicit architecture-evaluation worktrack if recall tests show the lightweight approach is insufficient.
- Whether untracked sample zip archives should be preserved as local manual-test fixtures, moved under documented fixtures, or ignored/deleted under a later governance decision.
