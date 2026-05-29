# RepoScope Analysis

## Metadata

- updated: 2026-05-29
- based_on_snapshot: .servo/repo/snapshot-status.md
- baseline_branch: develop
- baseline_commit: 629f7c7232e425d08484877593222cbeaec2ec1f

## Current State Summary

fdch0 confirmed the next work purpose changed from lightweight Chinese retrieval enhancement to a PostgreSQL hybrid search infrastructure track. The old planned milestones `MS-20260528-002 / docs 文档更新迭代与整理` and `MS-20260529-001 / 中文知识检索增强与结构化索引` are now superseded. The active planned pipeline is:

1. `MS-9 / PostgreSQL 与 Hybrid Search 架构基线`
2. `MS-10 / 知识库索引与 Hybrid Retrieval 实现`
3. `MS-11 / AI 草稿 Hybrid Context 接入与文档追平`

RepoScope is active, WorktrackScope is closed, and there is no active milestone or active worktrack. The current code baseline remains `629f7c7232e425d08484877593222cbeaec2ec1f` (`Merge MS8 addendum final acceptance`).

The pipeline now has 14 milestones: 9 completed, 2 superseded, 3 planned, 0 active. Only `MS-9` is ready for activation because `MS-10` depends on MS-9 and `MS-11` depends on MS-10.

## Goal Change Impact

- change_width: major
- old_goal: SQLite-based lightweight Chinese retrieval enhancement with normalization, n-gram/domain dictionary, structured fields, optional AI enrichment, and context expansion.
- new_goal: PostgreSQL + hybrid search with BM25/FTS lexical retrieval, pgvector semantic retrieval, fusion ranking, permission filtering, context expansion, AI draft context integration, and docs/operator catch-up.
- baseline_impact: current git baseline remains usable as pre-change baseline; implementation milestones must establish PostgreSQL dev/test/CI and migration readiness before code migration.
- active_worktrack_impact: none; no active worktrack exists.
- engineering_node_map_impact: `architecture` and `migration` node types are now first-class for upcoming worktracks.
- invariant_changes: SQLite is no longer a fixed technology target; PostgreSQL extension readiness and hybrid retrieval anti-cheat boundaries are now explicit invariants.

## Principal Contradictions

1. **Search infrastructure upgrade vs current SQLite implementation**: The current app and tests are SQLite-oriented, while the new goal requires PostgreSQL, pgvector, and BM25/FTS feasibility. MS-9 must resolve the database and extension baseline before implementation.
2. **BM25 quality vs deployability**: `pg_search` may provide stronger BM25 behavior, but deployability is not yet verified. The fallback is PostgreSQL native FTS plus Chinese tokenization/normalization if `pg_search` is not acceptable.
3. **Semantic recall vs citation integrity**: pgvector can improve semantic recall, but citation must remain tied to real source/snippet/path hits and must not become provider-generated evidence.
4. **Docs catch-up vs architecture churn**: Old docs cleanup is superseded because documenting now would chase a moving target. Docs belong in MS-11 after hybrid retrieval behavior is real.
5. **Remote CI baseline vs local target change**: local `develop` is ahead of `origin/develop`; new PostgreSQL CI readiness must be designed before remote validation becomes meaningful.

## Priority Assessment

| Priority | Item | Reason |
|----------|------|--------|
| P0 | Activate MS-9 | It is the first non-superseded planned milestone and resolves the architecture/database baseline needed for all later work. |
| P1 | WT-20260529-078 | Hybrid search ADR must decide PostgreSQL/pgvector/BM25/FTS/fallback boundaries before migration or feature work. |
| P1 | WT-20260529-079 | PostgreSQL dev/test/CI baseline is a hard prerequisite for reliable migration and validation. |
| P2 | WT-20260529-082 | Chinese retrieval quality gate should be established before implementation claims are accepted. |
| P3 | MS-11 docs catch-up | Docs should follow actual PostgreSQL/hybrid implementation, not precede it. |

## Route Projection

Completed milestones:

1. MS-20260523-001: 项目基本面更新
2. MS-20260523-002: 分模块代码质量治理
3. MS-20260523-003: API route handler 集成测试
4. MS-20260524-001: 项目整洁度与 AI 适配治理
5. MS-20260526-001: GitHub CI 与上云前决策基线
6. MS-20260526-002: AI 需求生成 Discussion MVP
7. MS-20260527-001: 管理员项目知识库管理与导入
8. MS-20260528-001: 知识库文件夹化管理与模块化 AI 草稿范围
9. MS-20260528-003: MS8 addendum

Superseded milestones:

1. MS-20260528-002: docs 文档更新迭代与整理 -> MS-11
2. MS-20260529-001: 中文知识检索增强与结构化索引 -> MS-9/MS-10/MS-11

Active milestone:

- none

Planned milestones:

1. MS-9: PostgreSQL 与 Hybrid Search 架构基线, 0/5 completed, next worktrack WT-20260529-078.
2. MS-10: 知识库索引与 Hybrid Retrieval 实现, 0/6 completed, blocked until MS-9 completion.
3. MS-11: AI 草稿 Hybrid Context 接入与文档追平, 0/5 completed, blocked until MS-10 completion.

Recommended next route:

1. Activate `MS-9`.
2. Initialize `WT-20260529-078 / Hybrid Search 架构决策与风险边界`.
3. Do not initialize MS-10 or MS-11 worktracks until MS-9 is accepted.

## Observation Readiness

- snapshot_freshness: goal reference changed after snapshot refresh; control plane has been updated for MS-9/MS-10/MS-11.
- goal_node_map_status: present; includes feature/refactor/bugfix/test/docs/governance/migration/architecture.
- milestone_pipeline_stale: no after this update; old planned milestones are superseded and new planned milestones are registered.
- worktrack_backlog_stale: no after this update; WT-078..WT-093 are registered.
- code_validation_status: no application code changed in this goal rewrite.
- handback_required: no for analysis; activation of MS-9 is the next RepoScope action.

## Unknowns / Next Options

- Whether `pg_search` is deployable in the intended local/CI/cloud environment.
- Whether PostgreSQL native FTS fallback needs Chinese parser/tokenizer support beyond normalization.
- Which embedding model/provider should generate vectors, and whether it reuses the existing AI provider config or a separate embedding config.
- Whether existing SQLite dev data needs one-time migration tooling or can be regenerated from seed/import flows for this stage.
