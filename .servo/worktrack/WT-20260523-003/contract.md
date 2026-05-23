# Worktrack Contract: WT-20260523-003

## Metadata

- worktrack_id: WT-20260523-003
- title: ESLint/TypeScript 基线确认与修复
- milestone_id: MS-20260523-001
- derived_from_milestone: true
- node_type: refactor
- status: active
- created_at: 2026-05-23
- updated: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: 79d6567c20de5dd760b32b6e05eb6dd6191abaea
- work_branch: worktrack/wt-20260523-003-lint-ts
- worktree_path: .worktrees/wt-20260523-003-lint-ts

## Node Type Constraints

- merge_required: yes
- baseline_form: commit-on-refactor-branch
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Scope

### Goal

修复当前 18 个 ESLint errors 和 16 个 warnings，将 `npm run lint` 的输出降为 0 error + 0 warning（或对保留的 warning 显式记录理由），并检查 TypeScript 配置。

### In Scope

- 修复所有 ESLint errors（阻断性）
- 修复可安全处理的 ESLint warnings（unused imports、prefer-const 等）
- 对 `no-explicit-any` 错误替换为具体类型或 unknown
- 修复 React hooks 问题（声明顺序、缺少依赖、setState-in-effect）
- 修复 Next.js no-html-link-for-pages（用 Link 替换 <a>）
- 检查 tsconfig.json 是否启用 strict 模式

### Out of Scope

- 不重构业务逻辑
- 不改变 API 行为
- 不修改 ESLint 配置规则
- 不新增依赖

### Affected Modules

- src/app/(dashboard)/layout.tsx
- src/app/(dashboard)/page.tsx
- src/app/(dashboard)/tickets/[id]/page.tsx
- src/app/(dashboard)/tickets/new/page.tsx
- src/app/(dashboard)/tickets/page.tsx
- src/app/api/tickets/[id]/members/route.ts
- src/app/api/tickets/[id]/route.ts
- src/app/api/tickets/route.ts
- src/app/api/tickets/stats/route.ts
- src/app/api/users/route.ts
- src/auth/index.ts
- src/components/ui/badge.tsx
- tsconfig.json

## Gate Criteria

- validation: `npm run lint` 输出 0 error + 0 warning（或 warning 有显式理由记录）
- policy: 不改变 API 行为，不修改 lint 规则

## Current Lint Baseline

34 problems (18 errors, 16 warnings):
- 6 unused imports (warnings)
- 2 no-html-link-for-pages (errors)
- 3 React hooks pattern issues (errors/warnings)
- 14 no-explicit-any (errors)
- 1 prefer-const (error)
- 2 unused function/variables (warnings)

## Intake Review Summary

- repo_fundamentals: 代码基线确认，所有功能就绪
- snapshot_freshness: snapshot 为最新，WT1/WT2 已闭环
- milestone_purpose_alignment: ESLint/TS 基线是 M1 第三步，与 purpose 对齐
- historical_conflict_risk: 低
- intake_review_verdict: ready_for_worktrack_init

## Runtime Dispatch

- runtime_dispatch_mode: delegated
- carrier: SubAgent (general-purpose)
