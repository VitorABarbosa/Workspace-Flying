---
phase: 09-auth-infrastructure
plan: "03"
subsystem: auth
tags: [supabase, next.js, server-components, react, permissions, rls]

# Dependency graph
requires:
  - phase: 09-02
    provides: LockedToolShell component, tool_permissions table, requiresAuth field on Tool interface
  - phase: 08-auth-infrastructure
    provides: AGENT_COMPONENTS dispatch in tools/[slug]/page.tsx
provides:
  - Permission guard in tools/[slug]/page.tsx — queries tool_permissions before rendering agent
  - Individual account toggle in LoginForm — email+password for non-team Supabase users
  - 9 real Jest tests replacing PERM-02/PERM-03 it.todo() stubs
  - Full PERM-01 through PERM-05 implementation complete
affects: [10-admin-panel]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server component async auth guard — getUser() then tool_permissions query before dispatch
    - Conditional form mode via showIndividualLogin state — preserves team path, adds individual path

key-files:
  created: []
  modified:
    - src/app/tools/[slug]/page.tsx
    - src/app/login/LoginForm.tsx
    - src/__tests__/LoginPage.test.tsx

key-decisions:
  - "getUser() used (not getSession()) in page.tsx — Supabase security requirement: getSession reads cookie without server validation"
  - "Permission check placed BEFORE AGENT_COMPONENTS dispatch (Pitfall 5 avoidance) — requiresAuth guard must run before any component selection"
  - "loginEmail = showIndividualLogin ? email : TEAM_EMAIL — TEAM_EMAIL constant preserved, individual path is additive"
  - "Toggle buttons have type=button outside <form> — prevents accidental form submission on toggle click"
  - "Error messages differentiated by mode: individual shows email+password error, team shows password-only error"

patterns-established:
  - "Async server component auth guard: async function + getUser() + DB query + conditional render (no redirect)"
  - "Mode-conditional form: single state flag controls field visibility, email source, and error message copy"

requirements-completed: [PERM-01, PERM-02, PERM-03, PERM-05]

# Metrics
duration: ~60min (including visual checkpoint)
completed: "2026-03-31"
---

# Phase 9 Plan 03: Wire Permission Guard + Individual Login Toggle Summary

**tool_permissions server-side guard in page.tsx renders LockedToolShell for unauthorized users; LoginForm extended with individual account email+password toggle; 9 PERM-02/PERM-03 tests pass**

## Performance

- **Duration:** ~60 min (including manual visual checkpoint)
- **Started:** 2026-03-31T21:20:00Z
- **Completed:** 2026-03-31T22:27:36Z
- **Tasks:** 3 (2 auto + 1 visual checkpoint)
- **Files modified:** 3

## Accomplishments

- `tools/[slug]/page.tsx` converted to async server component with permission guard: queries `tool_permissions` via `getUser()` + `maybeSingle()` before dispatching to agent
- `LoginForm.tsx` extended with `showIndividualLogin` toggle — team mode (TEAM_EMAIL constant) unchanged, individual mode adds email field and mode-specific error messages
- 9 real Jest tests replace `it.todo()` stubs from Plan 01 — full PERM-02/PERM-03 behavioral coverage
- Visual checkpoint confirmed: Pesquisador renders normally for team, LUMEN shows LockedToolShell without permission row, individual login toggle visible and functional

## Task Commits

Each task was committed atomically:

1. **Task 1: Add permission guard to tools/[slug]/page.tsx** - `22b7a7b` (feat)
2. **Task 2: Extend LoginForm with individual account toggle** - `8fdbdfc` (feat)
3. **Task 3: Visual checkpoint** - manual approval (no commit)

**Plan metadata:** (this commit — docs)

## Files Created/Modified

- `src/app/tools/[slug]/page.tsx` — async server component, imports LockedToolShell + createSupabaseServerClient, permission guard via tool_permissions table before AGENT_COMPONENTS dispatch
- `src/app/login/LoginForm.tsx` — showIndividualLogin state, email state, loginEmail conditional, mode-specific error strings, conditional email input, toggle buttons
- `src/__tests__/LoginPage.test.tsx` — 9 real tests replacing PERM-02/PERM-03 it.todo() stubs

## Decisions Made

- `getUser()` used instead of `getSession()` in page.tsx — Supabase security: getSession reads cookie without server-side validation
- Permission check placed before `AGENT_COMPONENTS` lookup (Pitfall 5 from RESEARCH.md) — guard must fire before any component selection logic
- `TEAM_EMAIL` constant preserved and unchanged — individual mode is strictly additive, team path untouched
- Toggle buttons placed outside `<form>` with `type="button"` — prevents accidental submit on click
- Error messages are mode-aware: "E-mail ou senha incorretos. Tente novamente." for individual, "Senha incorreta. Tente novamente." for team

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Pre-existing test failures (3 test suites: `styleMock.js`, `supabase.test.ts`, `HeroSubtitleSection.test.tsx`) and a TypeScript error in `PesquisadorAgent.test.tsx` are out of scope — documented as deferred items from prior phases. No new failures introduced by Phase 09-03 changes.

## Verification Results

All plan-specified checks passed:

| Check | Result |
|-------|--------|
| `grep requiresAuth src/app/tools/[slug]/page.tsx` | Line 95 — ✓ |
| `grep tool_permissions src/app/tools/[slug]/page.tsx` | Line 104 — ✓ |
| `grep getUser src/app/tools/[slug]/page.tsx` | Line 97 — ✓ |
| `grep getSession src/app/tools/[slug]/page.tsx` | 0 matches — ✓ |
| `grep showIndividualLogin src/app/login/LoginForm.tsx` | 5 matches — ✓ |
| `grep -rn NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY src/` | 0 matches — ✓ |
| Visual: Pesquisador renders for team | ✓ approved |
| Visual: LUMEN shows LockedToolShell (no permission row) | ✓ approved |
| Visual: individual login toggle visible and functional | ✓ approved |

## User Setup Required

None — no external service configuration required beyond what Plan 02 established (tool_permissions table already migrated).

## Next Phase Readiness

- PERM-01 through PERM-05 fully implemented and verified
- Phase 10 (Admin Panel) can use `user.app_metadata.role` from getUser() — available in page.tsx (PERM-05 foundation)
- tool_permissions table operational with RLS; service role key needed for Phase 10 INSERT/DELETE via Admin API
- No blockers for Phase 10 planning

---
*Phase: 09-auth-infrastructure*
*Completed: 2026-03-31*
