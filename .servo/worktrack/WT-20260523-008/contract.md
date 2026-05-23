# Worktrack Contract: WT-20260523-008

## Metadata

- worktrack_id: WT-20260523-008
- title: Attachments/Notifications API 审查与修复
- milestone_id: MS-20260523-002
- derived_from_milestone: true
- node_type: refactor
- status: completed
- created_at: 2026-05-23
- updated: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: 07c3c3d339c7e7db9bca790b8a71b456395675c8
- work_branch: worktrack/wt-20260523-008-att-notif
- worktree_path: .worktrees/wt-20260523-008-att-notif

## Node Type Constraints

- merge_required: yes
- baseline_form: commit-on-refactor-branch
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Scope

### Goal

对 Attachments 与 Notifications API 应用 Phase 9 API 质量治理标准，补齐认证、错误处理与输入边界。

### In Scope

- `src/app/api/tickets/[id]/attachments/route.ts`
- `src/app/api/tickets/[id]/attachments/[attachmentId]/route.ts`
- `src/app/api/notifications/route.ts`
- `src/app/api/notifications/[id]/route.ts`
- `src/app/api/notifications/read-all/route.ts`
- 使用统一 auth/error handling 模式

### Out of Scope

- 不改附件存储后端
- 不新增邮件通知
- 不改变现有 API 签名

### Affected Modules

- Attachments API
- Notifications API

## Gate Criteria

- validation: `npm run build` 通过, `npm run lint` 0 issue
- policy: 不改变 API 签名与现有用户流程

## Closeout Evidence

- status: completed
- commit: ad6791a8d0998760d39c9023101b615937a88c6d
- recorded_branch: worktrack/wt-20260523-008-att-notif (merged)
