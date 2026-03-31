---
phase: 09-auth-infrastructure
plan: 02
subsystem: auth
tags: [supabase, rls, lucide-react, tool-registry, jest]

# Dependency graph
requires:
  - phase: 09-01
    provides: LockedToolShell stub, LoginPage test stubs (Wave 0 contracts)
  - phase: 08-area-segmentation
    provides: Tool interface with areas: AreaSlug[] field
provides:
  - Tool interface with requiresAuth?: boolean (backward-compatible extension)
  - LUMEN tool marked requiresAuth: true in tools registry
  - LockedToolShell real implementation (AgentShell + LockKeyhole icon, blocked-state UI)
  - 5 passing LockedToolShell tests (converted from it.todo stubs)
  - Supabase tool_permissions table with RLS (manual step — awaiting checkpoint verification)
affects: [09-03-auth-infrastructure, src/app/tools/[slug]/page.tsx]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - requiresAuth?: boolean on Tool interface — optional field, undefined = no restriction (backward-compatible)
    - LockedToolShell wraps AgentShell with LockKeyhole icon + h2 heading + body text matching UI-SPEC verbatim
    - LockKeyhole aria-hidden="true" — icon is decorative, queried via container.querySelector('[aria-hidden="true"]') in tests

key-files:
  created: []
  modified:
    - src/config/tools.ts
    - src/components/tools/LockedToolShell.tsx
    - src/components/tools/__tests__/LockedToolShell.test.tsx

key-decisions:
  - "requiresAuth?: boolean added as optional field — undefined/false = no restriction, backward-compatible with all existing tools"
  - "LockKeyhole aria-hidden queried via container.querySelector('[aria-hidden=\"true\"]') not document.querySelector('svg') — consistent with existing JobStatusBadge test pattern"
  - "LockedToolShell mock updated to pass title as data-title attribute — enables title assertion in future tests"

patterns-established:
  - "LockedToolShell mock: data-testid='agent-shell' + data-title={title} — matches plan spec"
  - "Icon accessibility: aria-hidden='true' on decorative lucide-react icons, tested via container.querySelector"

requirements-completed:
  - PERM-01
  - PERM-04

# Metrics
duration: 8min
completed: 2026-03-31
---

# Phase 9 Plan 02: Auth Infrastructure — Tool Config + LockedToolShell Summary

**Tool interface extended with requiresAuth?: boolean, LUMEN marked as auth-restricted, and LockedToolShell implemented with LockKeyhole icon, h2 heading, and exact UI-SPEC body text — 5 stub tests converted to passing**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-31T22:03:37Z
- **Completed:** 2026-03-31T22:11:00Z
- **Tasks:** 1 of 2 completed (Task 2 is checkpoint:human-verify — Supabase SQL migration)
- **Files modified:** 3

## Accomplishments
- Extended `Tool` interface with `requiresAuth?: boolean` (optional, undefined = no restriction, backward-compatible)
- Marked LUMEN tool entry with `requiresAuth: true` in tools registry; Pesquisador unchanged
- Replaced null stub in `LockedToolShell.tsx` with real component using `AgentShell` wrapper, `LockKeyhole` icon, h2 heading "Acesso restrito", and exact body text from UI-SPEC
- Converted 5 `it.todo()` stubs to 5 real passing tests in `LockedToolShell.test.tsx`
- Full Jest suite: 324 passed, 4 pre-existing failures unchanged (supabase env vars + HeroSubtitleSection stale text + styleMock no-test file)

## Task Commits

1. **Task 1: Extend Tool interface + implement LockedToolShell** - `7ffdfb8` (feat)
2. **Task 2: Supabase SQL migration** - BLOCKED at checkpoint:human-verify (manual Supabase dashboard step required)

## Files Created/Modified
- `src/config/tools.ts` - Added `requiresAuth?: boolean` to Tool interface; added `requiresAuth: true` to LUMEN entry
- `src/components/tools/LockedToolShell.tsx` - Replaced null stub with real implementation (AgentShell + LockKeyhole + heading + body)
- `src/components/tools/__tests__/LockedToolShell.test.tsx` - 5 it.todo() stubs converted to 5 real passing tests; mock updated with data-title attribute

## Decisions Made
- `requiresAuth?: boolean` as optional field — undefined/false = no restriction (backward-compatible with all existing tools)
- `LockKeyhole aria-hidden="true"` queried via `container.querySelector('[aria-hidden="true"]')` not `document.querySelector('svg')` — consistent with existing `JobStatusBadge.test.tsx` pattern in this codebase
- Updated AgentShell mock to include `data-title={title}` attribute — enables title assertions in tests per plan spec

## Deviations from Plan

**1. [Rule 1 - Bug] Updated test for LockKeyhole icon assertion pattern**
- **Found during:** Task 1 (LockedToolShell implementation + tests)
- **Issue:** Plan spec used `document.querySelector('svg')` for icon assertion; existing codebase pattern uses `container.querySelector('[aria-hidden="true"]')` (see JobStatusBadge.test.tsx)
- **Fix:** Used `container.querySelector('[aria-hidden="true"]')` — both work, but container-scoped query is safer in multi-test suites and consistent with project conventions
- **Files modified:** src/components/tools/__tests__/LockedToolShell.test.tsx
- **Verification:** Test passes: `icon` found in DOM with aria-hidden="true"
- **Committed in:** 7ffdfb8

---

**Total deviations:** 1 auto-fixed (Rule 1 - consistent icon assertion pattern)
**Impact on plan:** No scope creep. Test behavior is identical — both approaches verify aria-hidden="true" is present on the LockKeyhole icon.

## Issues Encountered
None — Task 1 executed cleanly. Pre-existing test failures (supabase.test.ts, HeroSubtitleSection, styleMock) are documented in prior deferred-items.

## User Setup Required

Task 2 requires manual Supabase configuration before Plan 03 can proceed:

1. Open: https://supabase.com/dashboard/project/aofgtwyszwfbdcauhlwp > SQL Editor
2. Run the `tool_permissions` table creation SQL (see 09-02-PLAN.md Task 2)
3. Enable RLS and create select policy
4. Look up `team@flyingstudio.com.br` UUID in Auth > Users
5. Insert seed row: `(team_uuid, 'lumen')`
6. Verify in Table Editor: table exists, RLS enabled, 1 row present

## Next Phase Readiness
- Task 1 artifacts ready: `requiresAuth` on Tool interface, LUMEN flagged, LockedToolShell implemented and tested
- Task 2 (Supabase SQL migration) is awaiting human verification at checkpoint
- Plan 03 (page-level permission check + login form) can proceed after checkpoint is confirmed

---
*Phase: 09-auth-infrastructure*
*Completed: 2026-03-31 (partial — awaiting Task 2 checkpoint)*
