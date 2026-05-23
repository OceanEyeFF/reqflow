# Worktrack Contract: WT-20260523-006

## Metadata

- worktrack_id: WT-20260523-006
- title: Tickets API 审查与修复
- milestone_id: MS-20260523-002
- derived_from_milestone: true
- node_type: refactor
- status: active
- created_at: 2026-05-23
- updated: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: ac0f1ce0c4a2aa8ddf1cbc071806bfa10171904b
- work_branch: worktrack/wt-20260523-006-tickets
- worktree_path: .worktrees/wt-20260523-006-tickets

## Node Type Constraints

- merge_required: yes
- baseline_form: commit-on-refactor-branch
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Scope

### Goal

修复 Tickets API 核心路由（tickets/route.ts, [id]/route.ts, stats/route.ts）的错误处理、输入验证和安全问题。

### In Scope

- 3个核心路由: tickets/route.ts (GET/POST), [id]/route.ts (GET/PATCH/DELETE), stats/route.ts (GET)
- 添加 try/catch 到所有 handler
- 修复 GET scope 枚举绕过 bug
- 添加基本输入验证
- 提取 requireAuth 辅助函数
- 统一错误响应格式与 auth 模块一致

### Out of Scope

- members/route.ts, comments/route.ts, logs/route.ts → WT7
- attachments/route.ts → WT8
- 不引入 Zod 等新依赖（保持轻量）

### Affected Modules

- src/app/api/tickets/route.ts
- src/app/api/tickets/[id]/route.ts
- src/app/api/tickets/stats/route.ts
- src/lib/auth-helper.ts (新增)

## Gate Criteria

- validation: `npm run build` 通过, `npm run lint` 0 issue
- policy: 不改变 API 行为（除 scope bug 修复和错误格式统一外）

## Intake Review Summary

- repo_fundamentals: 质量基线就绪
- snapshot_freshness: 最新
- milestone_purpose_alignment: Tickets API 是 M2 第二个模块
- historical_conflict_risk: 低
- intake_review_verdict: ready_for_worktrack_init

## Runtime Dispatch

- runtime_dispatch_mode: delegated
- carrier: SubAgent (general-purpose)
