---
phase: 08-area-segmentation
plan: "01"
subsystem: tool-config
tags:
  - area-segmentation
  - typescript
  - config
  - tdd
dependency_graph:
  requires: []
  provides:
    - AreaSlug type
    - Area interface
    - AREAS constant
    - getAreaBySlug helper
    - getToolsByArea helper
    - Tool.areas required field
    - AreaCard.tsx stub
    - AreaCard.test.tsx contracts
    - AreaPage.test.tsx contracts
    - ToolsPage.test.tsx area-hub contracts
  affects:
    - src/config/tools.ts
    - src/components/tools/AreaCard.tsx
    - src/__tests__/AreaCard.test.tsx
    - src/__tests__/AreaPage.test.tsx
    - src/__tests__/ToolsPage.test.tsx
tech_stack:
  added: []
  patterns:
    - it.todo stubs as Nyquist test contracts
    - fs.readFileSync for Server Component tests
    - AreaSlug union type for exhaustiveness checking
key_files:
  created:
    - src/components/tools/AreaCard.tsx
    - src/__tests__/AreaCard.test.tsx
    - src/__tests__/AreaPage.test.tsx
  modified:
    - src/config/tools.ts
    - src/__tests__/ToolsPage.test.tsx
    - src/__tests__/ToolCard.test.tsx
decisions:
  - "areas: AreaSlug[] is required (not optional) on Tool interface — enforces area declaration at type level for all current and future tools"
  - "AreaCard.tsx stub returns null — minimal implementation to unblock jest.mock resolution in Plan 02 tests"
  - "ToolsPage.test.tsx fully replaced — old ToolCard assertions will be stale after Plan 02 area hub rewrite"
  - "ToolCard.test.tsx fixture updated with areas: [] — required to satisfy TypeScript after adding required field to Tool interface"
metrics:
  duration: "2 min 18 sec"
  completed_date: "2026-03-31"
  tasks_completed: 2
  files_created: 3
  files_modified: 3
---

# Phase 08 Plan 01: Area Config Foundation and Test Contracts Summary

**One-liner:** TypeScript foundation with AreaSlug union type, 6-entry AREAS constant, getAreaBySlug/getToolsByArea helpers, and it.todo test contracts for all three area components.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend tools.ts with area types, AREAS constant, and areas field on Tool | d892154 | src/config/tools.ts, src/__tests__/ToolCard.test.tsx |
| 2 | Create AreaCard.tsx stub and replace/create all three test files | 27a53f6 | src/components/tools/AreaCard.tsx, src/__tests__/AreaCard.test.tsx, src/__tests__/AreaPage.test.tsx, src/__tests__/ToolsPage.test.tsx |

## What Was Built

Extended `src/config/tools.ts` with the full area type system:

- `AreaSlug` union type with 6 values (producao, rh, animacao, marketing, comercial, operacional)
- `Area` interface with `slug: AreaSlug` and `name: string`
- `Tool` interface extended with required `areas: AreaSlug[]` field
- `AREAS` constant with 6 entries using exact UI display names (PRODUÇÃO, RH, ANIMAÇÃO, MARKETING, COMERCIAL, OPERACIONAL)
- `getAreaBySlug(slug: string): Area | undefined` helper
- `getToolsByArea(areaSlug: AreaSlug): Tool[]` helper
- Both existing tools (pesquisador, lumen) updated with areas declarations

Created `AreaCard.tsx` stub with correct export signature for jest.mock resolution.

Replaced three test files with it.todo contracts covering AREA-01 through AREA-06 requirements.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ToolCard.test.tsx fixture missing required areas field**
- **Found during:** Task 1
- **Issue:** After adding `areas: AreaSlug[]` as required on the Tool interface, the `activeTool` fixture in ToolCard.test.tsx was missing the field, causing TypeScript error
- **Fix:** Added `areas: []` to the activeTool fixture (empty array is valid for a test fixture)
- **Files modified:** src/__tests__/ToolCard.test.tsx
- **Commit:** d892154

## Verification

- `npx tsc --noEmit` — only pre-existing error in PesquisadorAgent.test.tsx (out of scope, documented in deferred items)
- `npx jest AreaCard AreaPage ToolsPage --no-coverage --passWithNoTests` — 3 suites passed, 19 todos, 0 failures
- `npx jest --no-coverage --passWithNoTests` — 4 pre-existing failures unchanged (styleMock, supabase, HeroSubtitleSection, LoginPage — all documented as deferred)

## Self-Check: PASSED
