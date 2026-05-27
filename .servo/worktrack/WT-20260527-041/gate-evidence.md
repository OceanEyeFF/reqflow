# Gate Evidence: WT-20260527-041

## Metadata

- worktrack_id: WT-20260527-041
- status: collecting
- updated: 2026-05-27

## Review Evidence

- Added `KnowledgeSnippet` schema and migration with source/version/path/order traceability.
- Added `readPrivateKnowledgeFile` storage helper with root containment guard.
- Added deterministic parser/chunker service in `src/lib/knowledge/parser.ts`.
- Added admin-only parse API: `POST /api/admin/knowledge/versions/[id]/parse`.
- Parser supports stored document imports and stored docs zip imports from the existing WT-040 raw upload records.
- Parser transitions versions/sources to `ready` on success and `failed` on parse failure, deleting stale snippets for the version.

## Validation Evidence

- `npm run lint` passed with ESLint 0 warnings.
- `npm run test` passed: 21 test files, 126 tests.
- `npm run build` passed with Next.js 16.2.6/Turbopack. Build emitted the known worktree multi-lockfile warning only.
- Targeted search confirmed parser code reads via private storage and does not introduce PostgreSQL/pgvector/embedding/semantic retrieval.

## Policy Evidence

- Parse API is admin-only through shared admin guard.
- Parser reads private `storageKey` via storage helper and does not expose raw filesystem paths.
- Parser does not use `public/uploads`.
- No retrieval ranking or AI prompt selection was added; WT-042 remains the retrieval/citation selection slice.
- Failed parse leaves no snippets for the failed version.

## Gate Verdict

- verdict: pass
- blockers: []
