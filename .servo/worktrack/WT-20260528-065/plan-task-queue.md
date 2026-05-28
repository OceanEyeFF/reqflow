# Plan / Task Queue: WT-20260528-065

## Queue Status

- status: completed
- current_task: none

## Tasks

### T1 - Clarification Contract

- status: completed
- action: extend provider-neutral types for fixed clarification directions while preserving flat question compatibility.
- validation: TypeScript and focused AI type/service tests.

### T2 - Provider Prompt And Normalization

- status: completed
- action: update Deepseek request output instructions and normalization to accept `directions[]`, cap each direction to 5 questions, and normalize old `questions[]`.
- validation: `src/lib/ai/deepseek-provider.test.ts`.

### T3 - Discussion UI

- status: completed
- action: render fixed direction sections in `/tickets/ai-discussion`, keep a single `answers` map keyed by question id, and send flattened answers to draft mode.
- validation: lint/build and targeted behavior review.

### T4 - API And Service Regression

- status: completed
- action: adjust draft-service/API tests for direction-bearing clarification responses without changing ticket creation boundaries.
- validation: focused tests for AI route/service/provider.

### T5 - Gate Evidence

- status: completed
- action: run required validation and record gate evidence for closeout.
- validation: `npm run lint`, focused tests, `npm run test`, `npm run build`, `git diff --check`.
