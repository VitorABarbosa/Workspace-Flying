---
phase: 06-lumen-global-leads-database
plan: "05"
subsystem: lumen/global-leads-view
tags: [lumen, global-leads, export, nuqs, testing]
dependency_graph:
  requires:
    - 06-02 (GlobalLeadsFilters + useGlobalLeadsFilters hook)
    - 06-04 (GlobalLeadsTable + GlobalLeadsPagination)
  provides:
    - GlobalLeadsView (top-level container)
    - LUMEN-10 tests (GlobalLeadsView renders core elements)
    - LUMEN-13 tests (export link with active filter params)
  affects:
    - LumenAgent.tsx (already imports and uses GlobalLeadsView)
tech_stack:
  added: []
  patterns:
    - module-level jest.fn() with getter proxy for per-test mockReturnValueOnce overrides
    - URLSearchParams built from useGlobalLeadsFilters state for export href
key_files:
  created:
    - src/components/agents/lumen/__tests__/GlobalLeadsView.test.tsx
  modified:
    - src/components/agents/lumen/GlobalLeadsView.tsx
decisions:
  - "useGlobalLeadsFilters called inside GlobalLeadsView (not passed as props) — enforces single source of truth for export URL construction"
  - "module-level mockUseGlobalLeadsFilters = jest.fn() with get accessor in mock factory — required for per-test mockReturnValueOnce without jest.requireMock gymnastics"
  - "min_score omitted from export URL when value is 0 — consistent with GlobalLeadsTable fetch behavior"
metrics:
  duration: 5min
  completed_date: "2026-03-30"
  tasks_completed: 3
  files_changed: 2
---

# Phase 06 Plan 05: GlobalLeadsView — Summary

**One-liner:** GlobalLeadsView container composing filters + table + XLSX export link built from active nuqs URL params, with 13 new green tests covering LUMEN-10 and LUMEN-13.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Create GlobalLeadsView.tsx | dfac8e6 | src/components/agents/lumen/GlobalLeadsView.tsx |
| 2 | Implement all GlobalLeadsView tests (LUMEN-10 + LUMEN-13) | 4a1087d | src/components/agents/lumen/__tests__/GlobalLeadsView.test.tsx |
| 3 | Full test suite green verification | (no files changed) | — |
| 4 | Visual checkpoint | PENDING — awaiting human verification | — |

## What Was Built

### GlobalLeadsView.tsx

- Renders "Banco de Leads" section heading
- Calls `useGlobalLeadsFilters()` internally to build the export URL — no filter props accepted
- Builds `URLSearchParams` from active filter state: city, segment, min_score (only when > 0), created_after
- Always appends `format=xlsx` to export URL
- Export `<a>` has `download` attribute and correct `aria-label`
- Composes `<GlobalLeadsFilters />` and `<GlobalLeadsTable>` with `selectedLead?.id` and `onSelectLead` props

### GlobalLeadsView.test.tsx

- 13 tests replacing 9 `it.todo` stubs
- LUMEN-10 group (5 tests): heading, filters rendered, table rendered, selectedLead.id passed through, null selectedLead handled
- LUMEN-13 group (8 tests): format=xlsx always present, download attr, aria-label, city/segment/min_score/created_after filter params, min_score omitted when 0

## Test Results

```
Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

All 10 lumen test suites: 120 passed, 50 todo (from earlier phases), 0 failed.

Full suite: 34 passed, 4 failed (pre-existing: styleMock, supabase, HeroSubtitleSection, LoginPage — documented in deferred-items from Phase 1/2).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] jest.mock factory used plain arrow function instead of jest.fn() for useGlobalLeadsFilters**
- **Found during:** Task 2
- **Issue:** The plan's test template used `jest.requireMock` to call `.mockReturnValueOnce` on `useGlobalLeadsFilters`, but the factory was a plain arrow function, not a `jest.fn()`. This caused `TypeError: mockReturnValueOnce is not a function` on 4 tests.
- **Fix:** Introduced module-level `mockUseGlobalLeadsFilters = jest.fn()` with a getter accessor in the `jest.mock` factory. Tests call `mockUseGlobalLeadsFilters.mockReturnValueOnce(...)` directly — cleaner and works correctly with `beforeEach` reset.
- **Files modified:** `GlobalLeadsView.test.tsx`
- **Commit:** 4a1087d

## Self-Check: PASSED

- [x] `src/components/agents/lumen/GlobalLeadsView.tsx` — FOUND
- [x] `src/components/agents/lumen/__tests__/GlobalLeadsView.test.tsx` — FOUND
- [x] Commit dfac8e6 — FOUND
- [x] Commit 4a1087d — FOUND
- [x] `grep "format.*xlsx" src/components/agents/lumen/GlobalLeadsView.tsx` — FOUND (exportParams.set('format', 'xlsx'))
- [x] 13 tests passing in GlobalLeadsView.test.tsx
