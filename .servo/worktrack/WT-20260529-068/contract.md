# Worktrack Contract: WT-20260529-068

## Metadata

- worktrack_id: WT-20260529-068
- title: docs-codewiki zip 混入文件兼容
- milestone_id: MS-20260528-003
- derived_from_milestone: true
- node_type: feature
- branch: worktrack/wt-20260529-068-tolerate-docs-zip-extras
- baseline_branch: develop
- baseline_commit: 71de0545e40288f8de505da7958e232312f7d778
- baseline_form: commit-on-feature-branch
- merge_required: yes
- gate_criteria: implementation + validation + policy
- if_interrupted_strategy: checkpoint-or-recover

## Task Goal

Support generated `docs-codewiki_*.zip` packages where the docs path contains markdown knowledge documents plus ordinary generated sidecar files such as `index.html` and metadata JSON.

## Scope In

- Inspect sample `docs-codewiki_*.zip` structure without committing the zip files.
- Keep zip path traversal and nested archive/script safety checks strict.
- Ignore ordinary unsupported sidecar files during zip import instead of rejecting the whole archive.
- Parse only allowed knowledge document entries.
- Add tests for mixed docs-codewiki zip packages.

## Scope Out

- Importing HTML as knowledge content.
- Importing nested archives, executable files, scripts, or binary assets.
- Changing file size limits or database schema.

## Acceptance Criteria

1. A zip with `.md` entries plus `index.html` and directory entries is accepted.
2. Parser creates snippets only for allowed document entries and skips unsupported sidecars.
3. A zip with only unsupported sidecars is rejected as having no importable documents.
4. Dangerous entries such as nested `.zip` remain rejected.
5. Existing upload security tests still pass.
