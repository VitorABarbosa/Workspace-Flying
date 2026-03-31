---
phase: 09-auth-infrastructure
plan: "02"
subsystem: auth
tags: [supabase, rls, tool-permissions, lucide-react, tool-registry, jest]

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
  - Supabase tool_permissions table with RLS + SELECT policy (manually verified by user)
affects:
  - 09-03 (page-level permission check queries tool_permissions and renders LockedToolShell)
  - 10-admin-panel (Admin Panel manages tool_permissions rows via Supabase Admin API)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - requiresAuth?: boolean on Tool interface — optional field, undefined = no restriction (backward-compatible)
    - LockedToolShell wraps AgentShell with LockKeyhole icon + h2 heading + body text matching UI-SPEC verbatim
    - LockKeyhole aria-hidden="true" — icon is decorative, queried via container.querySelector('[aria-hidden="true"]') in tests
    - Supabase RLS SELECT policy: (select auth.uid()) = user_id — row-level isolation for authenticated users

key-files:
  created: []
  modified:
    - src/config/tools.ts
    - src/components/tools/LockedToolShell.tsx
    - src/components/tools/__tests__/LockedToolShell.test.tsx

key-decisions:
  - "requiresAuth?: boolean added as optional field — undefined/false = no restriction, backward-compatible with all existing tools"
  - "LockKeyhole aria-hidden queried via container.querySelector('[aria-hidden=\"true\"]') not document.querySelector('svg') — consistent with existing JobStatusBadge test pattern"
  - "Seed row NOT inserted — Admin Panel (Phase 10) manages individual user permissions; inserting seed now would bypass intended admin workflow"
  - "tool_permissions table lives in Supabase Pesquisador project (aofgtwyszwfbdcauhlwp) temporarily — migration to dedicated frontend project planned for future milestone"

patterns-established:
  - "LockedToolShell mock: data-testid='agent-shell' + data-title={title} — enables title assertion in future tests"
  - "Icon accessibility: aria-hidden='true' on decorative lucide-react icons, tested via container.querySelector"
  - "Supabase RLS: enable row level security + create policy (select auth.uid()) = user_id for read isolation"

requirements-completed:
  - PERM-01
  - PERM-04
  - PERM-05

# Metrics
duration: 8min
completed: 2026-03-31
---

# Phase 9 Plan 02: Auth Infrastructure — Tool Config + LockedToolShell Summary

**Tool interface extended with requiresAuth?: boolean, LUMEN marked as auth-restricted, LockedToolShell fully implemented with 5 passing tests, and tool_permissions table live in Supabase with RLS — data and component layers ready for Plan 03 page-level permission check**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-31T22:03:37Z
- **Completed:** 2026-03-31T22:11:00Z
- **Tasks:** 2 of 2 completed
- **Files modified:** 3

## Accomplishments

- Extended `Tool` interface with `requiresAuth?: boolean` (optional, undefined = no restriction, backward-compatible)
- Marked LUMEN tool entry with `requiresAuth: true` in tools registry; Pesquisador unchanged
- Replaced null stub in `LockedToolShell.tsx` with real component using `AgentShell` wrapper, `LockKeyhole` icon, h2 heading "Acesso restrito", and exact body text from UI-SPEC
- Converted 5 `it.todo()` stubs to 5 real passing tests in `LockedToolShell.test.tsx`
- `tool_permissions` table created in Supabase with composite PK (user_id, tool_slug), ON DELETE CASCADE, RLS enabled, and SELECT policy for authenticated users
- Full Jest suite: 324 passed, 4 pre-existing failures unchanged (supabase env vars + HeroSubtitleSection stale text + styleMock no-test file)

## Task Commits

1. **Task 1: Extend Tool interface + implement LockedToolShell** - `7ffdfb8` (feat)
2. **Task 2: Supabase SQL migration** - verified by user (manual step — no code commit)

## Files Created/Modified

- `src/config/tools.ts` — Added `requiresAuth?: boolean` to Tool interface; added `requiresAuth: true` to LUMEN entry
- `src/components/tools/LockedToolShell.tsx` — Replaced null stub with real implementation (AgentShell + LockKeyhole + heading + body)
- `src/components/tools/__tests__/LockedToolShell.test.tsx` — 5 it.todo() stubs converted to 5 real passing tests; mock updated with data-title attribute

## Decisions Made

- `requiresAuth?: boolean` as optional field — undefined/false = no restriction (backward-compatible with all existing tools)
- `LockKeyhole aria-hidden="true"` queried via `container.querySelector('[aria-hidden="true"]')` — consistent with existing `JobStatusBadge.test.tsx` pattern in this codebase
- Updated AgentShell mock to include `data-title={title}` attribute — enables title assertions in tests per plan spec
- Seed row NOT inserted — Admin Panel (Phase 10) manages individual user permissions via Supabase Admin API. The plan originally specified inserting a seed row for team@flyingstudio.com.br, but the user intentionally deferred this to Phase 10

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

None — both tasks executed cleanly. Pre-existing test failures (supabase.test.ts, HeroSubtitleSection, styleMock) were documented in Plan 01 deferred-items and remain unchanged.

## User Setup Required

Completed manually by user:

1. Supabase Dashboard (project: aofgtwyszwfbdcauhlwp) > SQL Editor
2. `tool_permissions` table created with composite PK (user_id, tool_slug), FK to auth.users ON DELETE CASCADE, RLS enabled
3. SELECT policy created: "Users can view their own tool permissions" using `(select auth.uid()) = user_id`
4. Seed row NOT inserted — Admin Panel (Phase 10) will manage permissions individually

## Next Phase Readiness

- `requiresAuth` field on Tool interface is ready — Plan 03 can check `tool.requiresAuth` in page.tsx
- LUMEN is the only tool marked `requiresAuth: true` — Plan 03 gate logic applies only to LUMEN
- `LockedToolShell` is fully tested and ready to render in page.tsx when user lacks permission
- `tool_permissions` table is live in Supabase — Plan 03 can query `(user_id, tool_slug)` existence
- No blockers for Plan 03

---
*Phase: 09-auth-infrastructure*
*Completed: 2026-03-31*
