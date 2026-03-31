---
phase: 07-lumen-search-history
plan: 02
subsystem: lumen-agent
tags: [lumen, search-history, tab-switcher, historical-reopen, tdd]
dependency_graph:
  requires: [07-01]
  provides: [LUMEN-14, LUMEN-15]
  affects: [src/components/agents/lumen/LumenAgent.tsx]
tech_stack:
  added: []
  patterns: [historicalJobId state path, 3-tab switcher with TAB_LABELS constant, TDD RED-GREEN]
key_files:
  created: []
  modified:
    - src/components/agents/lumen/LumenAgent.tsx
    - src/components/agents/lumen/__tests__/LumenAgent.test.tsx
decisions:
  - "historicalJobId state is separate from live jobId — useJobPolling only receives live jobId, preventing accidental polling of completed historical jobs"
  - "Historical view renders inside busca tab via ternary (historicalJobId ? historical : live) — avoids a fourth tab and keeps the tab count at 3"
  - "handleNewSearch clears historicalJobId as first operation — ensures live search flow is clean after exiting historical view"
  - "handleBackToHistory sets historicalJobId=null AND activeTab='historico' atomically — single function, no partial state"
requirements-completed: [LUMEN-14, LUMEN-15]
metrics:
  duration: ~10min
  completed_date: "2026-03-30"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 7 Plan 02: LumenAgent 3-Tab Wiring and Historical Re-Open Summary

**One-liner:** LumenAgent extended with 3-tab switcher (Busca / Histórico / Banco de Leads) and historicalJobId state path enabling lead re-open from history without polling.

## What Was Built

Task 1 (TDD) extended `LumenAgent.tsx` to support the full LUMEN-15 flow:

1. **3-tab switcher** — `ActiveTab` type extended to `'busca' | 'historico' | 'banco'`; `TAB_LABELS` constant drives button labels; tab order is Busca → Histórico → Banco de Leads per LUMEN-14.

2. **`historicalJobId` state path** — New `useState<string | null>` that feeds `SearchLeadsList` for re-opened historical jobs. Live `jobId` and `historicalJobId` are strictly separate; `useJobPolling` only ever receives the live `jobId`.

3. **`handleReopenSearch(jobId)`** — Sets `historicalJobId` and switches to busca tab. Does NOT set live `jobId` (no polling side effect).

4. **`handleBackToHistory()`** — Clears `historicalJobId` and switches back to historico tab.

5. **Historical view in busca tab** — When `historicalJobId` is set, renders "Resultados históricos" heading, export XLSX link with historical job_id, `SearchLeadsList` with `jobId={historicalJobId}`, and action buttons "Voltar ao histórico" and "Nova busca".

6. **`handleNewSearch` updated** — Clears `historicalJobId` as the first operation before resetting other state.

7. **SearchHistoryList integrated** — Rendered in the historico tab with `onReopenSearch={handleReopenSearch}`.

8. **12 new test cases** — LUMEN-14 and LUMEN-15 describe blocks appended to `LumenAgent.test.tsx`. TDD RED→GREEN cycle confirmed.

## Deviations from Plan

None — plan executed exactly as written. All 9 surgical changes applied in the specified order.

## Test Results

```
Test Suites: 11 passed, 11 total (full lumen suite)
Tests:       50 todo, 147 passed, 197 total
```

`npm run build` exits 0 — no TypeScript errors.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 70fae48 | feat(07-02): add Histórico tab and historicalJobId state path to LumenAgent |

## Checkpoint Outcome

Task 2 (checkpoint:human-verify) was approved by the user. Visual verification at http://localhost:3000/tools/lumen confirmed:
- Three tabs visible: Busca / Histórico / Banco de Leads
- Histórico tab renders SearchHistoryList correctly
- Historical re-open switches to Busca tab and shows SearchLeadsList
- "Resultados históricos" heading (not "Busca concluída") shown in historical view
- "Exportar XLSX", "Voltar ao histórico", and "Nova busca" buttons visible
- Back-to-history and new-search flows working correctly

## Next Phase Readiness

Phase 7 (LUMEN Search History) is fully complete — LUMEN-14 and LUMEN-15 are shipped and user-confirmed. LumenAgent is stable at 3 tabs with historical re-open flow production-ready. Ready for Phase 8 (Area Segmentation) or Phase 9 (Auth Infrastructure) as defined in the v1.3 roadmap.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/components/agents/lumen/LumenAgent.tsx | FOUND (70fae48) |
| src/components/agents/lumen/__tests__/LumenAgent.test.tsx | FOUND (70fae48) |
| Commit 70fae48 (Task 1) | FOUND |
| Visual checkpoint (Task 2) | APPROVED by user |

---
*Phase: 07-lumen-search-history*
*Completed: 2026-03-30*
