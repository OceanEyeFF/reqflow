# Worktrack Contract: WT-20260523-007

## Metadata

- worktrack_id: WT-20260523-007
- title: Comments/Members/Logs API 审查与修复
- milestone_id: MS-20260523-002
- derived_from_milestone: true
- node_type: refactor
- status: active
- created_at: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: ec47ce6a11d7a99311fbde6842ec74d13aeefeab
- work_branch: worktrack/wt-20260523-007-comments-members
- worktree_path: .worktrees/wt-20260523-007-comments-members

## Scope

### Goal

对 Comments/Members/Logs API 应用与 WT6（Tickets API）相同的代码质量标准：try/catch、requireAuth()、输入验证、统一错误格式。

### In Scope

- tickets/[id]/comments/route.ts (GET/POST)
- tickets/[id]/members/route.ts (GET/POST/DELETE/PATCH)
- tickets/[id]/logs/route.ts (GET)
- 使用 requireAuth() 替换内联 auth 检查
- 统一错误格式

### Out of Scope

- 不重构代码结构（如提取 logTicketAction helper）

### Affected Modules

- src/app/api/tickets/[id]/comments/route.ts
- src/app/api/tickets/[id]/members/route.ts
- src/app/api/tickets/[id]/logs/route.ts

## Gate Criteria

- validation: build + lint 通过
- policy: 不改变 API 行为
