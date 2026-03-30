---
phase: 07-lumen-search-history
plan: "01"
subsystem: lumen
tags: [types, component, tdd, history, search-history]
dependency_graph:
  requires:
    - src/types/job.ts (JobState)
    - src/components/tools/JobStatusBadge.tsx
  provides:
    - src/types/lumen.ts (SearchHistoryItem, SearchHistoryResponse)
    - src/components/agents/lumen/SearchHistoryList.tsx (SearchHistoryList component)
  affects:
    - src/components/agents/lumen/LumenAgent.tsx (will use SearchHistoryList in Plan 02)
tech_stack:
  added: []
  patterns:
    - TDD (RED → GREEN): test file written before component file
    - fetchKey integer retry pattern (from SearchLeadsList reference)
    - import type { JobState } from '@/types/job' — first cross-type import in lumen.ts
key_files:
  created:
    - src/components/agents/lumen/SearchHistoryList.tsx
    - src/components/agents/lumen/__tests__/SearchHistoryList.test.tsx
  modified:
    - src/types/lumen.ts
decisions:
  - "SearchHistoryItem imports JobState from job.ts (Phase 7 intentional coupling — overrides Phase 5 no-import comment)"
  - "SearchHistoryList uses fetchKey integer increment for retry — same pattern as SearchLeadsList and GlobalLeadsTable"
  - "item.id ?? item.job_id fallback cast via (item as unknown as { job_id?: string }).job_id — avoids polluting SearchHistoryItem interface"
metrics:
  duration: "3 minutes"
  completed_date: "2026-03-30"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
---

# Phase 7 Plan 01: SearchHistoryList — Types and Component Summary

**One-liner:** SearchHistoryItem/SearchHistoryResponse types added to lumen.ts plus fully-tested SearchHistoryList component with fetch, loading/error/empty/list states and LUMEN-15 action gating.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend lumen.ts with SearchHistoryItem and SearchHistoryResponse | cc80dc0 | src/types/lumen.ts |
| 2 | Implement SearchHistoryList with tests | 454b903 | SearchHistoryList.tsx, SearchHistoryList.test.tsx |

## What Was Built

### Task 1 — lumen.ts type extensions

Added to `src/types/lumen.ts`:
- `import type { JobState } from '@/types/job'` at top of file
- `SearchHistoryItem` interface: `id`, `city`, `segments: string[]`, `state: JobState`, `found?`, `new?`, `duplicates?`, `created_at`
- `SearchHistoryResponse` interface: `data: SearchHistoryItem[]`
- All existing exports preserved (ApolloContact, ScoreBreakdown, Lead, LeadsResponse, LeadDetail)

### Task 2 — SearchHistoryList component + tests

`SearchHistoryList` is a self-contained `'use client'` component that:
- Fetches `GET /api/tools/lumen/search` on mount with `fetchKey` retry pattern
- **Loading state:** 5 skeleton rows × 8 columns with `animate-pulse`
- **Error state:** `AlertCircle` + "Erro ao carregar histórico" + "Tentar novamente" button that increments `fetchKey`
- **Empty state:** `History` icon + "Nenhuma pesquisa realizada ainda"
- **List state:** Table with columns Cidade, Segmentos, Status, Encontrados, Novos, Duplicados, Data, Ação
  - Segments: `item.segments.join(', ')` — comma-separated plain text
  - Status: `<JobStatusBadge state={item.state} />`
  - Counters: `item.found ?? '—'` / `item.new ?? '—'` / `item.duplicates ?? '—'` with `tabular-nums`
  - Date: `toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })`
  - **LUMEN-15 action gate:** "Ver leads" button rendered **only** when `item.state === 'completed'`; uses `item.id ?? item.job_id` fallback

Test file has **15 passing tests** covering all states and interactions.

## Test Results

```
Tests: 15 passed (SearchHistoryList suite)
Full lumen suite: 135 passed, 50 todo, 185 total — no regressions
Build: ✓ Compiled successfully
```

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/types/lumen.ts | FOUND |
| src/components/agents/lumen/SearchHistoryList.tsx | FOUND |
| src/components/agents/lumen/__tests__/SearchHistoryList.test.tsx | FOUND |
| Commit cc80dc0 (Task 1) | FOUND |
| Commit 454b903 (Task 2) | FOUND |
