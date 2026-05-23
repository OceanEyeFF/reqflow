# Repo Goal / Charter

## Metadata

- repo: reqflow
- owner: fdch0
- updated: 2026-05-23
- status: active

## Project Vision

ReqFlow — 一个稳定、可维护的轻量级内部工单需求协作系统，代码质量达到可长期迭代的标准。

## Core Product Goals

### Phase 9: 代码质量与治理

1. **项目基本面更新**: 完善 README、构建配置、项目文档，确保项目信息准确完整
2. **分模块代码质量治理**: 按功能模块逐个进行问题排查、代码审查、重构和测试补充
3. **已知问题修复**: 修复 handoff.md 中记录的已知问题和潜在隐患
4. **测试覆盖**: 为核心 API 和关键业务逻辑添加测试

## Technical Direction

- 保持现有技术栈不变 (Next.js 16 + Prisma 5 + SQLite + NextAuth v5)
- 坚持 worktree 工作流 (所有改动在 worktree 中完成)
- 每个 change 必须经过 `npm run build` 验证
- 不在此阶段引入新的外部依赖（除非修复必须）
- ESLint 0 warning 为质量基线

## Engineering Node Map

### Node Type Registry

| type | merge_required | baseline_form | gate_criteria | if_interrupted_strategy |
|------|---------------|---------------|---------------|-------------------------|
| `feature` | yes | commit-on-feature-branch | implementation + validation + policy | checkpoint-or-recover |
| `refactor` | yes | commit-on-refactor-branch | validation + policy | checkpoint-or-rollback |
| `bugfix` | yes | commit-on-bugfix-branch | implementation + validation + policy | checkpoint-or-rollback |
| `test` | yes | commit-on-test-branch | validation + policy | checkpoint-or-recover |
| `docs` | yes | commit-on-docs-branch | review + policy | checkpoint-or-recover |

### This Goal's Node Types

- type: `refactor`
  - expected_count: 2-4
  - merge_required: yes
  - baseline_form: commit-on-refactor-branch
  - gate_criteria: validation + policy
  - if_interrupted_strategy: checkpoint-or-rollback

- type: `bugfix`
  - expected_count: 3-5
  - merge_required: yes
  - baseline_form: commit-on-bugfix-branch
  - gate_criteria: implementation + validation + policy
  - if_interrupted_strategy: checkpoint-or-rollback

- type: `test`
  - expected_count: 2-3
  - merge_required: yes
  - baseline_form: commit-on-test-branch
  - gate_criteria: validation + policy
  - if_interrupted_strategy: checkpoint-or-recover

- type: `docs`
  - expected_count: 1-2
  - merge_required: yes
  - baseline_form: commit-on-docs-branch
  - gate_criteria: review + policy
  - if_interrupted_strategy: checkpoint-or-recover

### Node Dependency Graph

- `docs` → `refactor` (基本面文档先行，为分治提供上下文)
- `refactor` → `test` (重构完成后补充测试)
- `bugfix` (独立，可并行)

### Default Baseline Policy

- if_worktrack_interrupted: checkpoint-or-recover
- if_no_merge: rollback-to-baseline

## Success Criteria

- [ ] `npm run build` 零错误
- [ ] 核心 API 路径有测试覆盖
- [ ] handoff.md 中记录的已知问题已修复或标记为 deferred
- [ ] 代码 ESLint 0 warning
- [ ] README.md 反映当前项目真实状态
- [ ] 无明显重复代码模式（DRY）

## System Invariants

1. **API 向后兼容**: 所有现有 API 接口签名不变
2. **Schema 不删字段**: 数据库 Schema 不删除已有字段/表（仅可新增或标记 deprecated）
3. **Worktree 工作流**: 所有代码改动必须在 worktree 中完成
4. **Build Gate**: 每个 Worktrack 合并前必须通过 `npm run build`
5. **分支规范**: 功能分支命名 `feature/<name>`，修复分支 `fix/<name>`

## Notes

- Phase 9 整体目标：提升代码质量而非增加功能
- 分治策略：先基本面 → 再按模块逐块治理
- 不在此阶段引入 PostgreSQL 迁移或邮件通知等新功能
