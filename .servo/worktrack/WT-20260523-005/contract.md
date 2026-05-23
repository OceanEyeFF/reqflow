# Worktrack Contract: WT-20260523-005

## Metadata

- worktrack_id: WT-20260523-005
- title: Auth 模块审查与修复
- milestone_id: MS-20260523-002
- derived_from_milestone: true
- node_type: refactor
- status: active
- created_at: 2026-05-23
- updated: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: 389d8d068909b040e1ed2b513f1f1fb5857448ff
- work_branch: worktrack/wt-20260523-005-auth
- worktree_path: .worktrees/wt-20260523-005-auth

## Node Type Constraints

- merge_required: yes
- baseline_form: commit-on-refactor-branch
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-rollback

## Scope

### Goal

审查 Auth 模块（3 个源文件 + 1 个类型声明）的代码质量，修复发现的高/中优先级问题，统一错误处理模式。

### In Scope

- P0: 修复 `login/page.tsx` signIn 异常时 loading 状态无法重置
- P1: `index.ts` authorize 添加 try/catch 处理 Prisma 异常
- P1: `me/route.ts` 添加 try/catch + 已删除用户边界处理
- P1: `next-auth.d.ts` Session.user 继承 DefaultSession
- P1: `me/route.ts` session 有效但用户已删除时返回 401

### Out of Scope

- 不添加新功能（如速率限制、CAPTCHA）
- 不改变 API 行为（除错误响应格式统一）
- 不处理国际化 / i18n

### Affected Modules

- src/auth/index.ts (core config)
- src/app/api/auth/me/route.ts
- src/app/login/page.tsx
- src/types/next-auth.d.ts

## Gate Criteria

- validation: `npm run build` 通过, `npm run lint` 0 issue
- policy: 不改变 API 签名, 不引入新依赖

## Intake Review Summary

- repo_fundamentals: M1 建立的质量基线就绪 (ESLint 0, Build 通过)
- snapshot_freshness: 最新
- milestone_purpose_alignment: Auth 是 M2 分模块治理第一个模块
- historical_conflict_risk: 低 (auth 模块在 WT3/WT4 中仅做类型修复)
- intake_review_verdict: ready_for_worktrack_init

## Runtime Dispatch

- runtime_dispatch_mode: delegated
- carrier: SubAgent (general-purpose)
