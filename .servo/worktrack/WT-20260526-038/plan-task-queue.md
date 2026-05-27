# Plan / Task Queue: WT-20260526-038

## Task Queue

### T1: Initialize worktrack branch and baseline [completed]
- Create WT-038 worktree from refreshed `develop`.
- Confirm WT-037 review artifacts are merged.

### T2: Implement ticket access helper and route guards [completed]
- Add participant/admin access helper.
- Apply to ticket list/detail and child-resource routes.

### T3: Harden upload validation [completed]
- Require safe extension behavior and reject MIME/extension mismatches.
- Add tests for dangerous and mismatched uploads.

### T4: Add authorization regression tests [completed]
- Cover non-participant denial across affected routes.
- Preserve admin and participant happy paths.

### T5: Validate and close [completed]
- Run diff, lint, tests, and build.
- Write gate evidence and refresh Harness state.
