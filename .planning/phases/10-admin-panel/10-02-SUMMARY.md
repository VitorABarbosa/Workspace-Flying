---
phase: 10-admin-panel
plan: "02"
subsystem: auth
tags: [supabase, admin-api, middleware, react, testing]

# Dependency graph
requires:
  - phase: 10-01
    provides: Wave 0 test stubs (PERM-06, PERM-07 it.todo() contracts)
  - phase: 09-auth-infrastructure
    provides: middleware pattern, Supabase auth session, getUser() usage
provides:
  - createSupabaseAdminClient() — service role client with server-only guard
  - Admin route guard in middleware (PERM-06) — redirects non-admins to /tools
  - AdminPage server component — fetches all members via admin API
  - MemberList + MemberRow client components — renders member table with Desativado badge
  - All 11 tests passing (4 PERM-06 + 7 PERM-07)
affects:
  - 10-03 (Wave 2 — MemberRow action buttons, ban/unban/permissions management)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "service-role client: import 'server-only' + createClient with persistSession:false"
    - "admin guard: checks app_metadata.role in middleware (no extra DB query)"
    - "server component → client component: AdminPage fetches, passes Member[] to MemberList"
    - "JS-side join: permissionsMap built from tool_permissions rows, no SQL join needed"

key-files:
  created:
    - src/lib/supabase-admin.ts
    - src/app/admin/page.tsx
    - src/components/admin/MemberList.tsx
    - src/components/admin/MemberRow.tsx
  modified:
    - src/middleware.ts
    - src/__tests__/middleware.test.ts
    - src/components/admin/__tests__/MemberList.test.tsx
    - .env.example

key-decisions:
  - "import 'server-only' as first line of supabase-admin.ts prevents accidental client-side import at build time"
  - "Admin guard reads app_metadata.role from already-fetched user — zero extra DB queries"
  - "MemberList test wrapper omitted — component renders full <div><table> structure, no outer wrapper needed"
  - "tool_permissions joined in JS (permissionsMap) rather than SQL join — team < 50, simple and readable"

patterns-established:
  - "Admin API pattern: createSupabaseAdminClient() for any server-side admin operation"
  - "Role check pattern: user.app_metadata?.role !== 'admin' → redirect to /tools"

requirements-completed: [PERM-06, PERM-07]

# Metrics
duration: 6min
completed: 2026-03-31
---

# Phase 10 Plan 02: Admin Panel Wave 1 — Core Infrastructure Summary

**Supabase service-role admin client, middleware /admin guard, server-rendered member list, and 11 real passing tests (PERM-06 + PERM-07) replacing Wave 0 stubs**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-31T23:20:00Z
- **Completed:** 2026-03-31T23:26:47Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- `supabase-admin.ts` created with `import 'server-only'` guard — prevents service role key from leaking to client
- Middleware extended with `/admin/:path*` guard — non-admin authenticated users redirected to `/tools`, unauthenticated to `/login`
- `AdminPage` server component fetches all users via `admin.auth.admin.listUsers()` and joins `tool_permissions` in JS
- `MemberList` and `MemberRow` client components render member table with name/email/role/tools/Desativado badge
- 4 PERM-06 tests and 7 PERM-07 tests all passing (converted from Wave 0 `it.todo()` stubs)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create supabase-admin.ts + update .env.example** - `d60d5d3` (feat)
2. **Task 2: Extend middleware + convert PERM-06 stubs** - `9fdce9c` (feat)
3. **Task 3: Admin page + MemberList + MemberRow + PERM-07 tests** - `fdbc2a9` (feat)

## Files Created/Modified
- `src/lib/supabase-admin.ts` — Service role client with `import 'server-only'` and `persistSession: false`
- `src/app/admin/page.tsx` — Server component: fetches users + permissions, renders `<MemberList>`
- `src/components/admin/MemberList.tsx` — Client component: table with header, maps members to `MemberRow`; empty state
- `src/components/admin/MemberRow.tsx` — Client component: name/email/role/tools columns; Desativado badge on `bannedUntil`
- `src/middleware.ts` — Added `/admin/:path*` guard using `app_metadata?.role`
- `src/__tests__/middleware.test.ts` — Replaced PERM-06 `it.todo()` stubs with 4 real passing tests
- `src/components/admin/__tests__/MemberList.test.tsx` — Replaced 7 PERM-07 stubs with real passing tests
- `.env.example` — Appended `SUPABASE_SERVICE_ROLE_KEY` placeholder

## Decisions Made
- `import 'server-only'` as first line — build-time guard preventing client-side import
- Admin guard reads `app_metadata.role` from already-fetched user object — zero extra DB queries
- `MemberList` test renders without outer `<table><tbody>` wrapper — component already renders full table structure
- `tool_permissions` joined in JS via `permissionsMap` — team < 50, simple and readable

## Deviations from Plan

None - plan executed exactly as written. Minor test wrapper adjustment (removed redundant `<table><tbody>` wrap) as explicitly permitted by plan note "Adjust wrapper as needed based on the actual rendered HTML structure."

## Issues Encountered
None

## User Setup Required
**SUPABASE_SERVICE_ROLE_KEY must be added to .env** before running the admin panel in development or production. Copy from Supabase dashboard → Project Settings → API → Service role key.

## Next Phase Readiness
- Admin panel read-only experience complete — admin can see all members with their roles and permissions
- Wave 2 (Plan 10-03) ready to wire: ban/unban actions, tool permission checkboxes, `MemberRow` action buttons
- `MemberRow` has placeholder `—` in Actions column, intentionally stubbed for Wave 2

---
*Phase: 10-admin-panel*
*Completed: 2026-03-31*
