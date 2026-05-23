# Worktrack Contract: WT-20260523-009

## Metadata

- worktrack_id: WT-20260523-009
- title: 前端组件代码质量审查与修复
- milestone_id: MS-20260523-002
- derived_from_milestone: true
- node_type: refactor
- status: active
- created_at: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: ad6791a8d0998760d39c9023101b615937a88c6d
- work_branch: worktrack/wt-20260523-009-frontend
- worktree_path: .worktrees/wt-20260523-009-frontend

## Scope

### Goal

修复前端代码中的 2 个 HIGH bug，补充基本错误处理，提取共享类型，改善可访问性。

### In Scope (P0 + P1)

- P0: 修复 tickets/[id] 优先级下拉选 Bug (大写键 vs 小写值)
- P0: 修复 tickets/page 关键词搜索双重获取 + 添加防抖
- P1: 提取 Ticket 类型到 src/types/index.ts
- P1: 为关键 API fetch 调用添加基本错误处理
- P1: 添加 aria-label 到缺少的交互元素

### Out of Scope

- 不创建 src/hooks/ 目录 (未来 WT)
- 不完全抽象所有重复模式
- 不新增通知页面
- 不添加变更操作 loading 状态 (跨 WT 范围)

### Affected Modules

- src/app/(dashboard)/page.tsx
- src/app/(dashboard)/tickets/page.tsx
- src/app/(dashboard)/tickets/[id]/page.tsx
- src/app/(dashboard)/layout.tsx
- src/app/page.tsx
- src/types/index.ts

## Gate Criteria

- validation: build + lint 通过
- policy: 不改变 UI 行为逻辑 (bug 修复除外)
