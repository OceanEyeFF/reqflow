# Gate Evidence: WT-20260527-040

## Metadata

- worktrack_id: WT-20260527-040
- status: collecting
- updated: 2026-05-27

## Review Evidence

- Added SQLite-compatible `KnowledgeSource` and `KnowledgeSourceVersion` models plus migration.
- Added admin-only `POST /api/admin/knowledge/uploads` route.
- Added private storage helper writing under `.local-data/knowledge-uploads`, with `.local-data/` ignored.
- Added upload validation for `.md`, `.markdown`, `.txt`, `.json`, and `.zip`.
- Added conservative zip local-header scan for path traversal, nested archive, unsupported entry type, entry count, and uncompressed-size limits.
- Updated API test cleanup helper to clear new knowledge/provider tables before existing ticket/user tables.

## Validation Evidence

- `git diff --check` passed on 2026-05-27.
- `npm run lint` passed with ESLint 0 warnings.
- `npm run test` passed: 19 test files, 121 tests.
- `npm run build` passed with Next.js 16.2.6/Turbopack. Build emitted the known worktree multi-lockfile warning only.
- Targeted search confirmed knowledge upload implementation uses `.local-data/knowledge-uploads`; `public/uploads` appears only in existing attachment docs/routes and explicit non-goal/boundary text.

## Policy Evidence

- Admin upload API returns `401` unauthenticated and `403` for authenticated non-admin users.
- Upload API response omits raw filesystem paths and does not expose `.local-data`.
- Knowledge uploads do not use `public/uploads`.
- Unsupported files and unsafe zip traversal entries are rejected by tests.
- WT-040 does not implement parsing/chunking/retrieval, preserving WT-041/WT-042 boundaries.

## Gate Verdict

- verdict: pass
- blockers: []
