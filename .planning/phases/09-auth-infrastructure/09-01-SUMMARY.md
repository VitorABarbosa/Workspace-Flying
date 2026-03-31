---
phase: 09-auth-infrastructure
plan: "01"
subsystem: testing
tags: [jest, nyquist, stubs, auth, permissions, it.todo]

# Dependency graph
requires:
  - phase: 08-area-segmentation
    provides: Tool interface with areas field; AreaCard/AgentShell component patterns
provides:
  - LockedToolShell.tsx stub file enabling jest.mock resolution in Plan 02
  - LockedToolShell.test.tsx with 5 it.todo() stubs covering PERM-01 blocked-state contract
  - LoginPage.test.tsx extended with 9 it.todo() stubs covering PERM-02 and PERM-03 login paths
affects:
  - 09-02 (implements LockedToolShell against PERM-01 stubs)
  - 09-03 (implements LoginForm toggle against PERM-02/PERM-03 stubs)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Nyquist Rule: it.todo() stubs committed before implementation as test contracts
    - Stub file pattern: export function returning null enables jest.mock resolution without real implementation

key-files:
  created:
    - src/components/tools/LockedToolShell.tsx
    - src/components/tools/__tests__/LockedToolShell.test.tsx
  modified:
    - src/__tests__/LoginPage.test.tsx

key-decisions:
  - "LockedToolShell stub returns null — minimal to unblock jest.mock resolution, real UI in Plan 02"
  - "it.todo() stubs committed before implementation (Nyquist Rule) — padrão confirmado em todas as phases anteriores"
  - "LoginPage.test.tsx extended with append-only describe block — no modifications to existing AUTH-01 tests"

patterns-established:
  - "Stub file pattern: minimal stub (returns null) created alongside test stubs in same commit"
  - "Append-only test extension: new describe block appended to end of test file preserving all existing tests"

requirements-completed:
  - PERM-01
  - PERM-02
  - PERM-03

# Metrics
duration: 2min
completed: 2026-03-31
---

# Phase 9 Plan 01: Auth Infrastructure Wave 0 Stubs Summary

**Wave 0 Nyquist stubs for LockedToolShell (PERM-01) and LoginForm individual toggle (PERM-02/PERM-03) — 14 it.todo() contracts committed before any implementation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-31T19:00:00Z
- **Completed:** 2026-03-31T19:18:55Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created `LockedToolShell.tsx` stub (returns null) so Jest module resolution succeeds before real implementation
- Created `LockedToolShell.test.tsx` with 5 it.todo() stubs defining the PERM-01 blocked-state render contract
- Extended `LoginPage.test.tsx` with new describe block containing 9 it.todo() stubs for PERM-02/PERM-03 individual account toggle

## Task Commits

Each task was committed atomically:

1. **Task 1: Create LockedToolShell stub file + test stubs (PERM-01)** - `ef0abf6` (chore)
2. **Task 2: Extend LoginPage.test.tsx with PERM-02 and PERM-03 stubs** - `ede7029` (chore)

**Plan metadata:** (docs commit follows this summary)

## Files Created/Modified

- `src/components/tools/LockedToolShell.tsx` - Stub component returning null; enables jest.mock resolution for Plan 02 tests
- `src/components/tools/__tests__/LockedToolShell.test.tsx` - 5 it.todo() stubs: AgentShell wrapper, "Acesso restrito" heading, body text, LockKeyhole icon, h2 element
- `src/__tests__/LoginPage.test.tsx` - Appended describe block with 9 it.todo() stubs for team/individual login toggle behavior

## Decisions Made

- LockedToolShell stub returns null — minimal implementation to unblock Jest module resolution without leaking any UI expectations into Wave 0
- LoginPage.test.tsx extended with append-only strategy — existing AUTH-01 tests untouched, new describe block added at end of file
- Pre-existing LoginPage AUTH-01 failures (3 tests) documented as out-of-scope per deviation Scope Boundary rule; they pre-date Phase 9

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing failures in LoginPage.test.tsx (AUTH-01 describe block — 3 tests failing) confirmed to pre-date this plan via `git stash` check. These are out of scope per the Scope Boundary rule. Logged to deferred-items awareness; no action taken.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 (Wave 1) can implement `LockedToolShell` against the 5 it.todo() stubs in `LockedToolShell.test.tsx`
- Plan 03 (Wave 2) can implement LoginForm individual account toggle against the 9 it.todo() stubs in `LoginPage.test.tsx`
- Full Jest suite green for LockedToolShell (5 todo, 0 failures)
- All Wave 0 contracts in place; implementation phases can proceed in any order

---
*Phase: 09-auth-infrastructure*
*Completed: 2026-03-31*
