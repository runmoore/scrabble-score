# Tasks: Cryptogram Mapping Table Visual Redesign

**Input**: Design documents from `/specs/003-mapping-table-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Organization**: This is a simple single-component UI redesign with one user story. Tasks are organized in sequential order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 = User Story 1: Visual Distinction)
- Include exact file paths in descriptions

## Path Conventions

- **Remix Indie Stack**: `app/routes/` for route components
- **Tests**: `cypress/e2e/` for e2e tests

---

## Phase 1: User Story 1 - Visual Distinction (Priority: P1) 🎯 MVP

**Goal**: Transform the MappingGrid component from a box-based grid layout to a traditional HTML table with semantic elements, visible borders, and zebra striping to provide clear visual distinction from the inline mapping inputs above.

**Independent Test**: Load the cryptogram page on mobile and desktop, visually compare the solution area with the mapping table, and confirm they look distinctly different. All existing functionality (input, conflict highlighting, clear all, disabled states) must work identically.

### Implementation for User Story 1

- [x] T001 [US1] Read and understand the current MappingGrid component structure in app/routes/cryptogram.tsx (lines 273-345)
- [x] T002 [US1] Replace the grid container div with HTML table structure (table, tbody) in app/routes/cryptogram.tsx MappingGrid component
- [x] T003 [US1] Organize the 26-letter alphabet into row groups (4 rows: A-G, H-N, O-U, V-Z) in app/routes/cryptogram.tsx MappingGrid component
- [x] T004 [US1] Create table rows (tr elements) and map letters to table cells (td elements) in app/routes/cryptogram.tsx MappingGrid component
- [x] T005 [US1] Apply Tailwind table styling: w-full, border-collapse, border border-gray-300 to table element in app/routes/cryptogram.tsx MappingGrid component
- [x] T006 [US1] Apply zebra striping with even:bg-gray-50 to table rows in app/routes/cryptogram.tsx MappingGrid component
- [x] T007 [US1] Apply Tailwind cell styling: border border-gray-300, p-2, text-center to td elements in app/routes/cryptogram.tsx MappingGrid component
- [x] T008 [US1] Verify label and input elements remain unchanged with existing classes and conflict highlighting logic in app/routes/cryptogram.tsx MappingGrid component
- [x] T009 [US1] Test manually on mobile viewport (375px): verify table has visible borders, zebra striping, and accepts input
- [x] T010 [US1] Test manually on desktop: verify table has visible borders, zebra striping, and accepts input
- [x] T011 [US1] Test conflict highlighting: enter same letter for multiple cipher letters and verify red borders appear
- [x] T012 [US1] Test Clear All button: verify it clears all mappings in the table
- [x] T013 [US1] Test disabled state: enter 1000+ characters in puzzle input and verify table inputs are disabled
- [x] T014 [US1] Run npm run typecheck to verify no TypeScript errors
- [x] T015 [US1] Run npm run lint to verify code quality
- [x] T016 [US1] Run npm run format to apply consistent formatting
- [x] T017 [US1] Run npm run test:e2e:run to verify existing Cypress tests pass (may need selector updates if tests reference the grid structure)

**Checkpoint**: User Story 1 is complete. The mapping table now uses a responsive Flexbox layout with light gray cells (`bg-gray-50`), white gaps (`gap-2`/8px) serving as borders, and centered alignment - visually distinct from the inline inputs above, and maintains all existing functionality.

**Final Implementation Notes**:

- **Inverted color approach**: Light gray cells (`bg-gray-50`) with white gaps - avoids border doubling issues
- **Gap as borders**: `gap-2` (8px) provides clear visual separation, white background blends with page
- **Fixed-width cells**: 80px (`w-20`) prevents last row from looking disproportionate
- **Centered layout**: All rows including the last row are centered with `justify-center`
- **Natural responsiveness**: Column count adapts automatically based on screen width
  - 320px mobile: ~3 cells per row
  - 768px tablet: 8 cells per row
  - 1920px ultra-wide: 14 cells per row
- **SSR-compatible**: Pure CSS, no JavaScript required
- **Tested thoroughly**: 320px, 768px, 1920px all work perfectly
- **All 34 E2E tests passing**
- **All code quality checks passing**: typecheck, lint, format

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 1)**: No dependencies - single sequential implementation
  - Tasks T001-T008: Core implementation (sequential - each builds on previous)
  - Tasks T009-T013: Manual testing (can be done in parallel after T008)
  - Tasks T014-T017: Code quality gates (must run in sequence, after T013)

### Within User Story 1

**Sequential implementation required**:

1. T001: Understand current structure
2. T002-T004: Transform structure (div grid → table)
3. T005-T007: Apply styling (table styling, zebra striping, cell borders)
4. T008: Verify inputs unchanged

**Parallel testing after T008**:

- T009-T013 can be done in parallel (different test scenarios)

**Sequential quality gates after T013**:

- T014 → T015 → T016 → T017 (in order)

---

## Implementation Strategy

### MVP = User Story 1 (This Entire Feature)

This feature consists of a single user story, so completing User Story 1 delivers the entire MVP:

1. Complete T001-T008: Core implementation (transform grid to table)
2. Complete T009-T013: Manual validation (functionality preserved)
3. Complete T014-T017: Code quality gates (typecheck, lint, format, e2e tests)
4. **VALIDATE**: Compare before/after visually - table should be clearly distinct from inline inputs
5. **DONE**: Feature complete and ready for commit/deployment

### Time Estimate

- **Core Implementation** (T001-T008): 1-2 hours
- **Manual Testing** (T009-T013): 30 minutes
- **Code Quality** (T014-T017): 15 minutes
- **Total**: 2-2.5 hours

---

## Notes

- **No [P] markers**: All tasks are sequential for this single-component change
- **[US1] labels**: All tasks belong to User Story 1 (the only story)
- **Single file modified**: app/routes/cryptogram.tsx
- **No data model changes**: UI-only transformation
- **No API changes**: Client-side only
- **Low risk**: No business logic changes, only HTML/CSS structure
- **Existing tests**: May need selector updates if Cypress tests query the grid structure directly
- **Avoid abstractions**: Keep letter row grouping inline per Constitution Principle VIII
