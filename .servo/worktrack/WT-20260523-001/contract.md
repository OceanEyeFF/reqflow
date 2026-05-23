# Worktrack Contract: WT-20260523-001

## Metadata

- worktrack_id: WT-20260523-001
- title: README 项目信息更新
- milestone_id: MS-20260523-001
- derived_from_milestone: true
- node_type: docs
- status: active
- created_at: 2026-05-23
- updated: 2026-05-23

## Baseline

- baseline_branch: develop
- baseline_ref: e8f380a84dbcdcb335256ee28e866a3788fecc2e
- work_branch: worktrack/wt-20260523-001-readme
- worktree_path: .worktrees/wt-20260523-001-readme

## Node Type Constraints (from Goal Charter)

- merge_required: yes
- baseline_form: commit-on-docs-branch
- gate_criteria: review + policy
- if_interrupted_strategy: checkpoint-or-recover

## Scope

### Goal

将 README.md 从 Next.js 默认脚手架模板更新为 ReqFlow 项目真实信息，包括项目描述、技术栈、快速启动步骤、测试账号等。

### In Scope

- 重写 README.md 全部内容
- 包含: 项目名称与定位、技术栈列表、快速启动指南、测试账号、项目结构概览

### Out of Scope

- 不创建新的文档文件
- 不修改代码或配置
- 不更新 package.json 或其他元数据

### Affected Modules

- README.md (root)

## Gate Criteria

- review: README 内容评审通过（信息准确、结构清晰）
- policy: 符合 docs node_type 的 gate_criteria（review + policy）

## Acceptance Criteria

- README.md 包含 ReqFlow 项目名称和功能描述
- README.md 列出使用的技术栈
- README.md 包含 `npm install` + `npm run dev` 启动步骤
- README.md 包含测试账号信息
- README.md 包含基本项目结构说明

## Intake Review Summary

- repo_fundamentals: 项目已完整实现 Phase 1-8，所有功能就绪
- snapshot_freshness: snapshot-status.md 于 2026-05-23 更新，反映最新状态
- milestone_purpose_alignment: README 更新是"项目基本面更新"的第一步，与 M1 purpose 完全对齐
- historical_conflict_risk: 低风险，README.md 当前无并发修改
- worktrack_adjustment_recommendations: N/A
- intake_review_verdict: ready_for_worktrack_init

## Runtime Dispatch

- runtime_dispatch_mode: delegated
- carrier: SubAgent (general-purpose)
