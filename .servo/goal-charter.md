# Repo Goal / Charter

## Metadata

- repo: reqflow
- owner: fdch0
- updated: 2026-05-27
- status: active

## Project Vision

ReqFlow — 一个稳定、可维护的轻量级内部工单需求协作系统，代码质量达到可长期迭代的标准。

## Core Product Goals

### Phase 9: 代码质量与治理

1. **项目基本面更新**: 完善 README、构建配置、项目文档，确保项目信息准确完整
2. **分模块代码质量治理**: 按功能模块逐个进行问题排查、代码审查、重构和测试补充
3. **已知问题修复**: 修复 handoff.md 中记录的已知问题和潜在隐患
4. **测试覆盖**: 为核心 API 和关键业务逻辑添加测试
5. **AI 需求生成 Discussion MVP**: 使用 Deepseek 在受控 discussion 页面中辅助用户生成结构化工单草稿，保持人工确认边界
6. **管理员项目知识库管理与导入**: 在 AI discussion MVP 之后，提供管理员维护项目知识库的上传、解析、版本和引用能力

## Technical Direction

- 保持现有技术栈不变 (Next.js 16 + Prisma 5 + SQLite + NextAuth v5)
- 坚持 worktree 工作流 (所有改动在 worktree 中完成)
- 每个 change 必须经过 `npm run build` 验证
- 不在此阶段引入新的外部依赖（除非修复必须）
- ESLint 0 warning 为质量基线
- AI provider 使用 Deepseek，必须通过服务端 adapter 调用；Deepseek API key、base URL、模型、超时和限流不得进入客户端
- MS6 只实现 discussion + Deepseek + 人工确认的核心闭环；管理员知识库上传和 docs 风格 zip 导入拆分到 MS7
- MS6/MS7 均不默认引入 PostgreSQL/pgvector；如需要语义检索，必须单独重新评估

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
- [ ] AI 需求生成草稿必须人工确认后才进入工单流程
- [ ] Deepseek 调用与知识上下文处理不暴露服务端 secret 或上传原始包

## System Invariants

1. **API 向后兼容**: 所有现有 API 接口签名不变
2. **Schema 不删字段**: 数据库 Schema 不删除已有字段/表（仅可新增或标记 deprecated）
3. **Worktree 工作流**: 所有代码改动必须在 worktree 中完成
4. **Build Gate**: 每个 Worktrack 合并前必须通过 `npm run build`
5. **分支规范**: 功能分支命名 `feature/<name>`，修复分支 `fix/<name>`
6. **AI 人工确认边界**: AI 输出只能作为草稿/建议，不能绕过用户确认直接创建或修改工单
7. **Provider Secret 边界**: Deepseek 等外部 provider secret 只允许服务端读取，不得进入浏览器、提交文件、截图或工单内容
8. **Milestone DB Readiness Gate**: 每个 Milestone 交付给程序员最终验收前，必须针对当前 checkout 和当前 `DATABASE_URL` 执行 Prisma/数据库 readiness 检查：确认 `@prisma/client` 已安装并生成、`npx prisma validate` 通过、`npx prisma migrate status --schema prisma/schema.prisma` 显示数据库最新、当前数据库包含该 Milestone 依赖的表/字段/API schema surface；若该 Milestone 明确不涉及 Prisma/数据库，也必须在 Gate Evidence 中写明不适用理由。

## Notes

- Phase 9 整体目标：提升代码质量而非增加功能
- 分治策略：先基本面 → 再按模块逐块治理
- 不在此阶段引入 PostgreSQL 迁移或邮件通知等新功能
- 2026-05-27: 用户确认 MS6 使用 Deepseek，并将管理员知识库上传/zip 导入拆分为 MS7
