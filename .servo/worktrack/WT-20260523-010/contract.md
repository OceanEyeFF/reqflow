# Worktrack Contract: WT-20260523-010

## Metadata

- worktrack_id: WT-20260523-010
- title: 核心 API 测试补充
- milestone_id: MS-20260523-002
- derived_from_milestone: true
- node_type: test
- status: completed
- created_at: 2026-05-23
- updated: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: 40ccf2590bd2fd7d4f59ec5e0e353ad79a9c6599
- work_branch: worktrack/wt-20260523-010-tests
- worktree_path: .worktrees/wt-20260523-010-tests

## Node Type Constraints

- merge_required: yes
- baseline_form: commit-on-test-branch
- gate_criteria: validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Scope

### Goal

补充核心类型与认证辅助逻辑的 Vitest 测试，为后续 API route handler 集成测试建立测试基础设施。

### In Scope

- 配置 Vitest
- 添加 `src/types/index.test.ts`
- 添加 `src/lib/auth-helper.test.ts`
- 验证测试、lint 与 build 基线

### Out of Scope

- 不在本 worktrack 中覆盖所有 route handler 集成测试
- 不更换测试框架
- 不引入数据库测试夹具

### Affected Modules

- `package.json`
- `vitest.config.ts`
- `src/types/index.test.ts`
- `src/lib/auth-helper.test.ts`

## Gate Criteria

- validation: `npm run test`, `npm run lint`, `npm run build` 通过
- policy: 测试代码不改变产品运行行为

## Closeout Evidence

- status: completed
- commit: 1608c7a8893eee68fe203f4cc921a94524814369
- test_result: `npm run test` 通过，2 个测试文件，29 个测试
- build_result: `npm run build` 通过
