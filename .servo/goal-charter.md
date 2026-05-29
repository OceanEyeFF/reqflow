# Repo Goal / Charter

## Metadata

- repo: reqflow
- owner: fdch0
- updated: 2026-05-29
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
6. **管理员项目知识库管理与导入**: 提供管理员维护项目知识库的上传、解析、版本、引用和 Provider 配置能力
7. **多知识库与 AI 草稿范围控制**: 支持多知识库、路径保留导入、选择性删除、AI 知识库范围选择、回答语言和多草稿拆分
8. **知识库生命周期与 AI 追问质量**: 支持知识库编辑、禁用/归档、创建入口、固定方向 AI 追问、逐题回答和空追问兜底
9. **文档与检索质量后续治理**: planned 工作包括 docs 文档更新整理，以及中文知识检索增强与结构化索引

## Technical Direction

- 保持现有技术栈不变 (Next.js 16 + Prisma 5 + SQLite + NextAuth v5)
- 坚持 worktree 工作流 (所有改动在 worktree 中完成)
- 每个 change 必须经过 `npm run build` 验证
- 不在此阶段引入新的外部依赖（除非修复必须）
- ESLint 0 warning 为质量基线
- AI provider 使用 Deepseek，必须通过服务端 adapter 调用；Deepseek API key、base URL、模型、超时和限流不得进入客户端
- AI discussion、管理员知识库、多知识库选择、AI 语言选项、多草稿拆分、知识库编辑/归档和多方向追问已完成并验收
- MS-20260528-002 planned: 集中追平 docs 中的 MS6/MS7/MS8、Prisma、AI Provider、知识库导入和验收文档
- MS-20260529-001 planned: 中文知识检索增强与结构化索引；不默认引入 PostgreSQL/pgvector/外部向量数据库，如需要语义检索或技术栈升级，必须单独重新评估

## Engineering Node Map

### Node Type Registry

| type | merge_required | baseline_form | gate_criteria | if_interrupted_strategy |
|------|---------------|---------------|---------------|-------------------------|
| `feature` | yes | commit-on-feature-branch | implementation + validation + policy | checkpoint-or-recover |
| `refactor` | yes | commit-on-refactor-branch | validation + policy | checkpoint-or-rollback |
| `bugfix` | yes | commit-on-bugfix-branch | implementation + validation + policy | checkpoint-or-rollback |
| `test` | yes | commit-on-test-branch | validation + policy | checkpoint-or-recover |
| `docs` | yes | commit-on-docs-branch | review + policy | checkpoint-or-recover |
| `governance` | yes | commit-on-governance-branch | policy + traceability | checkpoint-or-recover |

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
  - expected_count: 2-4
  - merge_required: yes
  - baseline_form: commit-on-docs-branch
  - gate_criteria: review + policy
  - if_interrupted_strategy: checkpoint-or-recover

- type: `governance`
  - expected_count: 0-2
  - merge_required: yes
  - baseline_form: commit-on-governance-branch
  - gate_criteria: policy + traceability
  - if_interrupted_strategy: checkpoint-or-recover

### Node Dependency Graph

- `docs` → `refactor` (基本面文档先行，为分治提供上下文)
- `refactor` → `test` (重构完成后补充测试)
- `bugfix` (独立，可并行)
- `governance` (独立，用于控制面规则或验收边界变更)

### Default Baseline Policy

- if_worktrack_interrupted: checkpoint-or-recover
- if_no_merge: rollback-to-baseline

## Success Criteria

- [x] `npm run build` 零错误，最新记录为 WT-20260529-077
- [x] 核心 API 路径有测试覆盖
- [x] 代码 ESLint 0 warning，最新记录为 WT-20260529-077
- [x] AI 需求生成草稿必须人工确认后才进入工单流程
- [x] Deepseek 调用与知识上下文处理不暴露服务端 secret 或上传原始包
- [x] 管理员知识库、多知识库选择、知识库生命周期和 AI 多方向追问已完成验收
- [ ] README.md 与 docs 路径文档需要通过 MS-20260528-002 继续追平
- [ ] 中文知识检索召回质量需要通过 MS-20260529-001 继续增强
- [ ] handoff.md 中记录的已知问题已修复或标记为 deferred
- [ ] 无明显重复代码模式（DRY）

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
- 2026-05-29: MS8 addendum 已由 fdch0 最终验收；当前 planned milestone 为 MS-20260528-002 docs 文档更新迭代与整理，以及 MS-20260529-001 中文知识检索增强与结构化索引
