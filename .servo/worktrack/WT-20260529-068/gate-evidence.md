# Gate Evidence: WT-20260529-068

## Metadata

- worktrack_id: WT-20260529-068
- title: docs-codewiki zip 混入文件兼容
- milestone_id: MS-20260528-003
- node_type: feature
- collected_at: 2026-05-29
- branch: worktrack/wt-20260529-068-tolerate-docs-zip-extras

## Sample Evidence

- Inspected untracked samples:
  - `docs-codewiki_business-product.zip`
  - `docs-codewiki_business-quality.zip`
  - `docs-codewiki_stem-cell-business.zip`
- Samples include markdown knowledge files plus ordinary generated sidecars such as `index.html`, directory entries, and metadata/module-tree JSON files.
- Sample zip files remain untracked and were not committed.

## Implementation Evidence

- Zip validation now validates every entry path for traversal/absolute-path safety.
- Zip validation still rejects dangerous entries such as nested archives and executable/script-like files.
- Ordinary unsupported sidecars are ignored rather than rejecting the full zip.
- Importable zip documents are centralized as `.md`, `.markdown`, `.txt`, and `.json`.
- Parser now uses the same importable-entry filter and creates snippets only for importable documents.

## Validation Evidence

- Focused tests: pass, 2 files / 16 tests.
  - `src/lib/knowledge/upload-validation.test.ts`
  - `src/lib/knowledge/parser.test.ts`
- `npm run lint`: pass.
- `npm run test`: pass, 28 files / 199 tests.
- `npm run build` with `DATABASE_URL=file:./dev.db`: pass.
  - Note: Next.js emitted the known worktree multi-lockfile warning; build completed successfully.

## Policy Evidence

- No database schema or migration was changed.
- Path traversal and dangerous nested archive protections remain active.
- HTML sidecars are not imported as knowledge content.
- No uploaded raw files are moved into public storage.

## Gate Verdict

- implementation_gate: pass
- validation_gate: pass
- policy_gate: pass
- final_verdict: pass
