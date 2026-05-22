---
title: "Repo Goal / Charter"
artifact_type: "goal-charter"
generated_from: "servo-set-harness-goal-skill/assets/goal-charter.md"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Repo Goal / Charter

> 这是 `.servo/goal-charter.md` 的运行样例，用来记录当前 repo 的长期目标和方向。最终内容应与 `docs/harness/artifact/repo/goal-charter.md` 的定义一致。

## Metadata

- repo: reqflow
- owner: servo-kernel
- updated: 2026-05-22
- status: active

## Project Vision

- ReqFlow 是轻量级公司内部工单需求协作系统，维护现有 Next.js 16 / TypeScript / Prisma / SQLite 实现，并以小步 worktrack 方式继续推进功能、稳定性、权限、通知、附件和后续生产化改造。

## Core Product Goals

- 提供经过登录保护的内部工单工作流，覆盖工单创建、列表筛选、详情查看、状态更新、负责人分配和操作日志。
- 支持围绕工单的协作能力，包括协作者角色、评论、附件上传、本地附件访问、站内通知和未读提醒。
- 保持管理与执行视角清晰：Dashboard 统计、最近工单、我参与的工单、工单筛选和详情页应能支撑日常处理。
- 让本地开发环境可重复启动：Prisma schema、SQLite 开发库、seed 数据、NextAuth credentials 登录和 npm scripts 保持一致。
- 为后续生产化演进保留路径，包括移动端适配、用户管理、标签/搜索、统计报表、外部消息集成和从 SQLite 迁移到 PostgreSQL。

## Technical Direction

- 继续使用 Next.js 16 App Router、React 19、TypeScript、TailwindCSS v4、Prisma 5、SQLite 和 NextAuth v5 beta 作为当前技术基线。
- 任何 Next.js 代码修改前必须读取 `node_modules/next/dist/docs/` 中相关指南，并遵守仓库 `AGENTS.md` 的 Next.js 破坏性变更提醒。
- 所有代码改动必须通过 worktree 工作流完成；Harness 管理基线分支为 `develop-aw`，局部 worktrack 分支从该基线派生并经 gate 后合并回基线。
- 后端优先保持现有 App Router route handler + Prisma Client 模式；数据库结构变更必须伴随 Prisma migration/seed 影响评估。
- 前端优先复用现有 `src/components/ui/*` 组件和 dashboard layout，保持工具型内部系统的紧凑、可扫描、可重复操作体验。
- 验证默认从 `npm run lint`、`npm run build`、Prisma schema/migration 检查和针对性代码审查开始；无法运行的命令必须记录原因与替代证据。

## Engineering Node Map

> 本 Goal 涉及的工程节点类型规划，供 `init-worktrack-skill` 在拆分 worktrack 时参考。
> 不是 worktrack 拆分本身，而是定义"这个 Goal 下会产生哪些类型的工程节点"及其约束。

### Node Type Registry

可复用的节点类型定义（全局参考）：

| type | merge_required | baseline_form | gate_criteria | if_interrupted_strategy | 说明 |
|------|---------------|---------------|---------------|-------------------------|------|
| `feature` | yes | commit-on-feature-branch | implementation + validation + policy | checkpoint-or-recover | 新功能开发 |
| `refactor` | yes | commit-on-refactor-branch | validation + policy | checkpoint-or-rollback | 重构，不改变外部行为 |
| `research` | no | annotated-tag-or-report | review-only | preserve-report-and-stop | 调研/探针，产出可能不可合并 |
| `bugfix` | yes | commit-on-bugfix-branch | implementation + validation + policy | checkpoint-or-rollback | 缺陷修复 |
| `docs` | yes | commit-on-docs-branch | review + policy | checkpoint-or-recover | 文档更新 |
| `config` | yes | commit-on-config-branch | validation + policy | checkpoint-or-rollback | 配置/部署变更 |
| `test` | yes | commit-on-test-branch | validation + policy | checkpoint-or-recover | 专项测试 |

### This Goal's Node Types

> 列出本 Goal 预期会涉及的节点类型：

- type: feature
  - expected_count: ongoing
  - merge_required: yes
  - baseline_form: commit-on-feature-branch
  - gate_criteria: implementation + validation + policy
  - if_interrupted_strategy: checkpoint-or-recover
- type: bugfix
  - expected_count: ongoing
  - merge_required: yes
  - baseline_form: commit-on-bugfix-branch
  - gate_criteria: implementation + validation + policy
  - if_interrupted_strategy: checkpoint-or-rollback
- type: refactor
  - expected_count: as-needed
  - merge_required: yes
  - baseline_form: commit-on-refactor-branch
  - gate_criteria: validation + policy
  - if_interrupted_strategy: checkpoint-or-rollback
- type: docs
  - expected_count: as-needed
  - merge_required: yes
  - baseline_form: commit-on-docs-branch
  - gate_criteria: review + policy
  - if_interrupted_strategy: checkpoint-or-recover
- type: config
  - expected_count: as-needed
  - merge_required: yes
  - baseline_form: commit-on-config-branch
  - gate_criteria: validation + policy
  - if_interrupted_strategy: checkpoint-or-rollback
- type: test
  - expected_count: as-needed
  - merge_required: yes
  - baseline_form: commit-on-test-branch
  - gate_criteria: validation + policy
  - if_interrupted_strategy: checkpoint-or-recover
- type: research
  - expected_count: as-needed
  - merge_required: no
  - baseline_form: annotated-tag-or-report
  - gate_criteria: review-only
  - if_interrupted_strategy: preserve-report-and-stop

### Node Dependency Graph

> 如果有明确的节点间依赖关系：

- research -> feature (when productionization, integration, or migration direction is uncertain)
- config -> feature (when environment, auth, upload storage, or database configuration is a prerequisite)
- test -> feature (when a feature lacks sufficient validation surface)
- docs -> feature (when stale operator-facing instructions would mislead implementation or verification)

### Default Baseline Policy

- if_worktrack_interrupted: preserve branch, task queue, current diff, and evidence references; recover without widening scope.
- if_no_merge: keep worktrack branch and gate evidence for handback; do not update `develop-aw` baseline or repo snapshot.

## Success Criteria

- Users can authenticate with the supported local credentials flow and use the protected dashboard and ticket pages without breaking the App Router structure.
- Ticket APIs and pages preserve core workflows for create/read/update/delete, comments, members, logs, attachments, notifications, and statistics.
- Prisma schema, migrations, generated client expectations, seed data, and local SQLite development usage remain coherent after each accepted change.
- Worktrack changes pass their declared implementation, validation, and policy gates before baseline integration.
- Operator-facing docs, handoff notes, and Harness artifacts stay aligned with verified code behavior and current package/version facts.
- Future productionization work can be introduced incrementally without forcing unrelated rewrites of the existing scaffold.

## System Invariants

- Do not modify the main checkout directly; code changes must happen in worktrees and be integrated through the approved branch workflow.
- Harness control state must not store business truth; goal, snapshot, worktrack contract, task queue, and evidence remain separate formal artifacts.
- Do not infer new long-term product goals from code alone; goal changes require explicit programmer approval.
- Do not change Next.js APIs, routing, or configuration from memory; inspect the installed Next.js docs first.
- Preserve authentication and authorization expectations around protected pages and ticket/member/comment/attachment/notification APIs.
- Database model changes require migration impact review and must not silently break existing seed/login assumptions.

## Notes

- This goal was confirmed by the programmer on 2026-05-22 during initial Harness adoption.
