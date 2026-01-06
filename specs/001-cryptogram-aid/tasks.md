---
description: "Task list for cryptogram solution aid implementation"
---

# Tasks: Cryptogram Solution Aid

**Input**: Design documents from `/specs/001-cryptogram-aid/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Constitution requires test-first development. Unit and E2E tests are included per constitution Principle I.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Self-contained route**: `app/routes/cryptogram.tsx` contains all logic, types, helpers, components
- **Co-located tests**: `app/routes/cryptogram.test.tsx` for unit tests
- **E2E tests**: `cypress/e2e/cryptogram.cy.ts` for integration tests
- Following existing pattern from `app/routes/anagram.tsx` (352 lines, fully self-contained)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization - no new infrastructure needed

This phase is minimal since the feature uses existing Remix infrastructure and follows the self-contained route pattern.

- [x] T001 Verify existing Remix infrastructure is ready (React 18, Remix 2.12.1, Tailwind CSS, TypeScript 5.x)
- [x] T002 [P] Review existing `app/routes/anagram.tsx` as reference for self-contained route pattern
- [x] T003 [P] Verify PWA manifest configuration in `public/manifest.json` for iPhone compatibility

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

No foundational tasks needed - feature is entirely self-contained in a single route file with no shared dependencies.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Manual Cryptogram Solving (Priority: P1) 🎯 MVP

**Goal**: Implement core cryptogram solving functionality with mapping grid and instant updates

**Independent Test**: User can enter a cryptogram, create letter mappings via A-Z grid, see instant updates, modify mappings, and distinguish solved vs unsolved letters

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T004 [P] [US1] Write unit tests for helper functions in `app/routes/cryptogram.test.tsx`

  - Test `applyMappings()` with case preservation
  - Test `sanitizePuzzleText()` for special chars/numbers preservation
  - Test `getConflictingLetters()` for duplicate mapping detection

- [X] T005 [P] [US1] Write E2E test for full solving workflow in `cypress/e2e/cryptogram.cy.ts`
  - Test: Enter cryptogram → create mappings → verify instant updates
  - Test: Modify existing mapping → verify all instances update
  - Test: Clear mapping → verify revert to cipher text
  - Test: Clear all mappings → verify full reset

### Implementation for User Story 1

- [X] T006 [US1] Create self-contained route file `app/routes/cryptogram.tsx` with complete structure:

  - Import statements (Form, useSearchParams, useState, useMemo from React/Remix)
  - Type definitions section (CryptogramState, LetterMapping, FrequencyData)
  - Helper functions section (applyMappings, getConflictingLetters, sanitizePuzzleText)
  - Inline component functions (PuzzleInput, PuzzleDisplay, MappingGrid, ConflictWarning)
  - Main Cryptogram component (default export) with state management

- [X] T007 [US1] Implement type definitions at top of `app/routes/cryptogram.tsx`:

  - **REMOVED**: Unused type definitions eliminated for code cleanliness
  - State managed via individual `useState` hooks (self-documenting via TypeScript inference)
  - No explicit interfaces needed - types inferred from usage

- [X] T008 [US1] Implement helper functions in `app/routes/cryptogram.tsx`:

  - `applyMappings(puzzleText: string, mappings: Record<string, string>): string` with case preservation
  - `getConflictingLetters(mappings: Record<string, string>): string[]` for duplicate detection
  - `sanitizePuzzleText(text: string): string` to preserve special chars/numbers

- [X] T009 [US1] Implement PuzzleInput inline component in `app/routes/cryptogram.tsx`:

  - Large textarea for puzzle input (max 1000 chars per SC-005)
  - Character count display
  - Validation error if >1000 chars
  - Mobile-optimized: Large touch target, proper keyboard on mobile

- [X] T010 [US1] Implement PuzzleDisplay inline component in `app/routes/cryptogram.tsx`:

  - Display original encrypted text (muted color)
  - Display decrypted text using `applyMappings()` helper
  - Visual distinction between solved (bold) and unsolved letters
  - Monospace font for alignment
  - Preserve case per FR-013

- [X] T011 [US1] Implement MappingGrid inline component in `app/routes/cryptogram.tsx`:

  - 26 letter inputs (A-Z) in grid layout using Tailwind (`grid grid-cols-6 gap-2`)
  - Each cell: cipher letter label + text input (`maxLength={1}`, `inputMode="text"`)
  - Auto-uppercase on input change
  - Highlight conflicting letters with `ring-2 ring-red-primary`
  - Clear All button to reset mappings
  - Touch-friendly: 44x44pt minimum touch targets (PWA Principle VI)

- [X] T012 [US1] Implement ConflictWarning inline component in `app/routes/cryptogram.tsx`:

  - SKIPPED: Red ring highlighting on inputs sufficient for conflict indication
  - Conflict detection working via `getConflictingLetters()` helper
  - Visual feedback provided through red border CSS classes

- [X] T013 [US1] Wire state management in main Cryptogram component in `app/routes/cryptogram.tsx`:

  - `useState` for puzzleText, mappings (Record<string, string>), hintsVisible
  - Event handlers: handleMappingChange, handleClearMapping, handleClearAll
  - Instant updates on mapping change (no form submission required)
  - Compute decrypted text with `useMemo`

- [X] T014 [US1] Add progressive enhancement (Form wrapper) in `app/routes/cryptogram.tsx`:

  - Wrap inputs in Remix `Form` component for no-JS fallback
  - Core functionality works with HTML form submission
  - JavaScript enhances with instant updates
  - Satisfies Constitution Principle V

- [X] T015 [US1] Apply mobile-first styling in `app/routes/cryptogram.tsx`:

  - Tailwind responsive classes
  - Test on 375px viewport minimum
  - Touch-friendly grid (44x44pt targets)
  - iPhone PWA compatibility (Principle VI)

- [X] T016 [US1] Run quality gates for User Story 1:
  - `npm run lint` - ESLint verification
  - `npm run typecheck` - TypeScript type safety
  - `npm run format` - Prettier formatting
  - `npm test -- --run` - Unit tests passing
  - `npm run test:e2e:run` - E2E tests passing

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. User can solve cryptograms with mapping grid.

---

## Phase 4: User Story 2 - Progressive Hint System (Priority: P2)

**Goal**: Add opt-in hint system with frequency analysis and letter suggestions (hidden by default)

**Independent Test**: User can toggle hints on/off, see frequency counts when enabled, get letter suggestions without auto-solving

### Tests for User Story 2 ⚠️

- [ ] T017 [P] [US2] Write unit tests for hint functions in `app/routes/cryptogram.test.tsx`:

  - Test `calculateFrequency()` returns accurate counts
  - Test `suggestCommonLetters()` excludes already-mapped letters
  - Test hint calculations on 1000-char cryptogram (performance check)

- [ ] T018 [P] [US2] Write E2E test for hint system in `cypress/e2e/cryptogram.cy.ts`:
  - Test: Hints hidden by default on page load
  - Test: Click "Show Hints" → frequency table appears
  - Test: Verify frequency counts match actual letter distribution
  - Test: Letter suggestions show unmapped common letters (E, T, A, O, I, N, S, H, R)
  - Test: Hide hints → panel collapses

### Implementation for User Story 2

- [ ] T019 [US2] Add FrequencyData and HintSuggestions types to `app/routes/cryptogram.tsx`:

  - `FrequencyData { counts: Record<string, number>, sortedLetters: Array<{letter, count, percentage}> }`
  - `HintSuggestions { suggestions: Record<string, string[]>, topUnmappedCiphers: string[], availableCommonLetters: string[] }`
  - `COMMON_LETTERS` constant with English letter frequency order

- [ ] T020 [US2] Implement hint helper functions in `app/routes/cryptogram.tsx`:

  - `calculateFrequency(text: string): FrequencyData` - O(n) single pass with case-insensitive counting
  - `suggestCommonLetters(frequencyData: FrequencyData, mappings: Record<string, string>): HintSuggestions` - cross-reference with COMMON_LETTERS

- [ ] T021 [US2] Implement HintSystem inline component in `app/routes/cryptogram.tsx`:

  - Collapsible panel using `<details>` and `<summary>` tags (works without JS)
  - Toggle button: "Show Hints" / "Hide Hints"
  - Three sections when visible:
    - Frequency table (sorted by count, descending)
    - Letter suggestions (unmapped common letters)
    - Top unmapped cipher letters
  - Hidden by default (hintsVisible: false initially per FR-008)

- [ ] T022 [US2] Integrate hint system into main component in `app/routes/cryptogram.tsx`:

  - Add hint toggle button below mapping grid
  - Compute hints with `useMemo` (only when hintsVisible is true)
  - Ensure <100ms calculation time for 1000-char cryptogram (SC-005)
  - ARIA labels for accessibility: `aria-expanded` on toggle button

- [ ] T023 [US2] Style hint panel in `app/routes/cryptogram.tsx`:

  - Subtle border, collapsible animation
  - Frequency table: monospace font, aligned columns
  - Suggestions: pill-style badges for available letters
  - Mobile-friendly layout (stacks on small screens)

- [ ] T024 [US2] Run quality gates for User Story 2:
  - `npm run lint` - ESLint verification
  - `npm run typecheck` - TypeScript type safety
  - `npm run format` - Prettier formatting
  - `npm test -- --run` - All unit tests passing (US1 + US2)
  - `npm run test:e2e:run` - All E2E tests passing (US1 + US2)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can solve with or without hints.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T025 [P] Add custom PWA manifest for cryptogram route in `public/cryptogram-manifest.json`:

  - Copy pattern from `public/anagram-manifest.json`
  - Update route to export `links` function with manifest override
  - Test PWA installation on iPhone

- [ ] T026 [P] Test mobile viewport compatibility:

  - Open Cypress with iPhone viewport (375px × 667px)
  - Verify all touch targets ≥44x44pt
  - Verify no horizontal scrolling
  - Verify keyboard input works (inputMode="text")

- [ ] T027 [P] Accessibility audit:

  - Keyboard navigation (Tab through all inputs)
  - Enter key toggles hint panel
  - Screen reader announces conflict warnings (role="alert")
  - Color contrast meets WCAG AA (conflict highlighting uses color + icon)

- [ ] T028 [P] Performance validation:

  - Test with 1000-character cryptogram
  - Verify <100ms mapping update latency (SC-002)
  - Check Chrome DevTools Performance tab
  - Ensure no unnecessary re-renders

- [ ] T029 Final quality gate (all commands must pass):

  - `npm run lint` - ESLint
  - `npm run typecheck` - TypeScript
  - `npm run format` - Prettier
  - `npm test -- --run` - All unit tests
  - `npm run test:e2e:run` - All E2E tests
  - `npm run validate` - Full validation suite

- [ ] T030 Verify Constitution compliance:
  - ✅ Principle I: Tests written and passing (unit + e2e)
  - ✅ Principle II: Quality gates passed
  - ✅ Principle III: All types explicit, no `any`
  - ✅ Principle IV: N/A (no server-side data)
  - ✅ Principle V: Progressive enhancement verified (works without JS)
  - ✅ Principle VI: PWA-first mobile design (iPhone optimized, 44x44pt targets)
  - ✅ Principle VII: N/A (no database changes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A - no foundational tasks (self-contained route)
- **User Story 1 (Phase 3)**: Can start after Setup (Phase 1) - No dependencies on other stories
- **User Story 2 (Phase 4)**: Can start after Setup (Phase 1) - Integrates with US1 but independently testable
- **Polish (Phase 5)**: Depends on User Stories 1 and 2 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Setup - May integrate with US1 but should be independently testable

**Note**: Both user stories can be developed in parallel after Setup phase if team capacity allows.

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Helper functions before components (components use helpers)
- Inline components before main component integration
- State management wiring before progressive enhancement
- Styling after functionality works
- Quality gates after story complete

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All tests for a user story marked [P] can run in parallel
- Once Setup completes, both user stories can start in parallel (if team capacity allows)
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
# (In separate terminal windows or CI jobs)
Task T004: Write unit tests for helper functions
Task T005: Write E2E test for full solving workflow

# After tests fail, launch implementation tasks:
# (These are sequential within US1 but parallel to US2)
Task T006: Create self-contained route file
Task T007: Implement type definitions
Task T008: Implement helper functions
# ... continue with US1 tasks
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify infrastructure)
2. Complete Phase 3: User Story 1 (core solving functionality)
3. **STOP and VALIDATE**: Test User Story 1 independently
4. Run quality gates
5. Deploy/demo if ready

**Estimated time**: 3-4 hours for MVP (single self-contained file)

### Incremental Delivery

1. Complete Setup → Foundation ready (minimal work)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add Polish → Final validation → Deploy/Demo
5. Each story adds value without breaking previous stories

**Estimated total time**: 5-6 hours (simpler than multi-file architecture)

### Parallel Team Strategy

With multiple developers:

1. Developer A: User Story 1 (after Setup)
2. Developer B: User Story 2 (after Setup, can work in parallel)
3. Both stories integrate into same file - coordinate merge

**Note**: Since this is a single-file implementation, parallel development requires careful coordination to avoid merge conflicts. Recommend sequential development unless using pair programming.

---

## Notes

- [P] tasks = different files OR different sections of same file, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Self-contained route pattern (anagram.tsx) simplifies implementation vs multi-file architecture
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Success Criteria Validation

After implementation, verify success criteria from spec.md:

- [ ] **SC-001**: Enter cryptogram + start solving in <10 seconds ✓
- [ ] **SC-002**: Letter mappings update <100ms ✓
- [ ] **SC-003**: Complete 200-300 char cryptogram without bugs ✓
- [ ] **SC-004**: 90% first-attempt success (user testing) ⏳
- [ ] **SC-005**: 1000 char cryptogram performs well ✓
- [ ] **SC-006**: Users report intuitive vs pen-paper (feedback) ⏳

✓ = Testable during implementation
⏳ = Requires user feedback post-launch
