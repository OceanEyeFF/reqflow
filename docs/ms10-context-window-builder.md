# MS-10 Context Window Builder

## Scope

WT-20260529-087 adds context window construction on top of hybrid fused hits. It does not connect the result to AI draft generation, add admin UI, or expand the evaluation harness.

## Behavior

- `buildHybridContextWindow()` calls hybrid retrieval, then expands from fused snippet ids.
- Adjacent expansion is limited to the same `sourceId`, `versionId`, and `sourcePath`.
- Expansion repeats the enabled/ready/selected knowledge-base filters rather than trusting previously returned ids.
- Included snippets are deduplicated and capped by `maxContextChars`.
- Citation groups are built only from included snippets and grouped by source/path/section.

## Evidence

Context evidence records:

- `included` snippets with reason `selected-hit` or `adjacent`;
- `dedupedSnippetIds`;
- `cappedSnippetIds`;
- `skippedSnippetIds`;
- configured `maxContextChars` and `adjacentChunks`.

## Deferred Work

AI draft context integration and UI/debug presentation are MS-11 scope. Broad regression harness coverage is WT-088 scope.
