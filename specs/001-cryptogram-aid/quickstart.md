# Quickstart: Cryptogram Solution Aid Implementation

**Feature**: 001-cryptogram-aid
**Date**: 2026-01-06
**Estimated Time**: 4-6 hours for MVP (User Story 1 + 2)

## Prerequisites

Before starting implementation:

- [x] Specification reviewed (`spec.md`)
- [x] Implementation plan approved (`plan.md`)
- [x] Research decisions documented (`research.md`)
- [x] Data model defined (`data-model.md`)
- [x] Component contracts defined (`contracts/component-interfaces.md`)

## Implementation Order

Follow this sequence for systematic, testable development:

**IMPORTANT**: Following the existing repo pattern (`app/routes/anagram.tsx`), all code will be in a **single self-contained route file**: `app/routes/cryptogram.tsx`. No separate component or utility files needed.

### Phase 1: Self-Contained Route File (3-4 hours)

**Goal**: Implement complete feature in single file following anagram.tsx pattern

**File to create**: `app/routes/cryptogram.tsx`

**Steps**:

```bash
# 1. Create the route file
touch app/routes/cryptogram.tsx

# 2. Follow this structure (see anagram.tsx as reference):
# - Import statements
# - Type definitions (inline)
# - Helper functions (inline)
# - Inline component functions
# - Main route component (default export)

# 3. Implement in this order within the single file:
# a. Type definitions at top
# b. Helper functions (applyMappings, calculateFrequency, etc.)
# c. Inline components (PuzzleInput, MappingGrid, HintSystem, etc.)
# d. Main Cryptogram component with state management
# e. Progressive enhancement (Form wrapper)

# 4. Test as you go
npm run dev
# Visit http://localhost:3000/cryptogram
```

**Acceptance**:

- ✅ Single file contains all logic, types, components
- ✅ User can enter puzzle text
- ✅ User can create letter mappings via grid
- ✅ Puzzle updates instantly
- ✅ Hint system toggles on/off
- ✅ Conflict warnings appear
- ✅ No TypeScript errors (`npm run typecheck`)

---

### Phase 2: Co-located Tests (1.5 hours)

**Goal**: Add tests next to route file

**Files to create**:

1. `app/routes/cryptogram.test.tsx` - Unit tests for helpers and components
2. `cypress/e2e/cryptogram.cy.ts` - E2E tests

**Steps**:

```bash
# 1. Create co-located unit test file
# Test helper functions and component behavior
# Example from anagram: Test shuffleLetters(), sanitiseQuery(), etc.

# 2. Create E2E test
# Test full user workflows
# No custom commands needed - use standard Cypress commands

# 3. Run all tests
npm test -- --run            # Unit tests
npm run test:e2e:run         # E2E tests
```

**Acceptance**:

- ✅ Helper functions tested (unit tests)
- ✅ User workflows tested (e2e tests)
- ✅ All tests passing

---

### Phase 3: Polish & Quality Gates (30 min)

**Goal**: Final quality checks and styling refinements

**Steps**:

```bash
# 1. Run all quality gates
npm run lint           # ESLint
npm run typecheck      # TypeScript
npm run format         # Prettier

# 2. Fix any issues

# 3. Run full test suite
npm test -- --run            # Unit tests
npm run test:e2e:run         # E2E tests

# 4. Mobile testing
# Open Cypress with mobile viewport (375px)
npm run test:e2e:dev
# Select "cryptogram.cy.ts"
# Change viewport to iPhone

# 5. Accessibility audit
# - Check color contrast (Chrome DevTools)
# - Verify keyboard navigation
# - Test with screen reader (VoiceOver/NVDA)

# 6. Performance check
# Enter 1000-character cryptogram
# Verify <100ms update latency (Chrome DevTools Performance)
```

**Acceptance**:

- ✅ `npm run lint` passes
- ✅ `npm run typecheck` passes
- ✅ `npm run format` applied
- ✅ All tests passing (unit + e2e)
- ✅ Mobile-friendly (tested on 375px viewport)
- ✅ Accessible (keyboard nav, screen reader)
- ✅ Performance <100ms (SC-002 satisfied)

---

## Testing Checklist

Before marking feature complete, manually verify:

### User Story 1: Manual Cryptogram Solving

- [ ] Enter a cryptogram in the puzzle input
- [ ] Cryptogram displays with mapping grid showing A-Z
- [ ] Enter a letter mapping (e.g., Q → E)
- [ ] All instances of Q update to E instantly
- [ ] Change mapping (Q → A), verify updates
- [ ] Clear single mapping (Q clears), verify revert
- [ ] Clear all mappings, verify full reset
- [ ] Case preservation works (Qwerty → Awerty not AWERTY)

### User Story 2: Progressive Hint System

- [ ] Hints not visible on page load
- [ ] Click "Show Hints" button
- [ ] Frequency table appears with accurate counts
- [ ] Letter suggestions show unmapped common letters
- [ ] Top cipher letters sorted by frequency
- [ ] Hide hints, panel collapses

### Edge Cases

- [ ] Map Q→E, then W→E → Warning appears, both allowed
- [ ] Enter "Hello, World! 123" → Punctuation and numbers preserved
- [ ] Enter 1000-character cryptogram → No performance issues
- [ ] Map Q→Q → Allowed (unusual but valid)

### Mobile Testing

- [ ] Touch-friendly input fields
- [ ] Grid layout responsive (doesn't overflow)
- [ ] Keyboard opens as text input (not numeric)
- [ ] No horizontal scrolling

### Accessibility

- [ ] Tab through all inputs in order
- [ ] Enter key toggles hint panel
- [ ] Screen reader announces warnings
- [ ] Color contrast passes (conflict highlighting)

---

## Common Issues & Solutions

### Issue: Mappings not updating instantly

**Solution**: Ensure `onChange` handlers are wired correctly, not waiting for form submission.

```tsx
// ✅ Correct (instant)
<input onChange={(e) => handleMappingChange(cipher, e.target.value)} />

// ❌ Wrong (requires form submit)
<input name={`mapping_${cipher}`} />
```

---

### Issue: Case not preserved

**Solution**: Check `applyMappings()` preserves original case:

```typescript
// Before mapping, check if original char was lowercase
const isLowerCase = char === char.toLowerCase();
const mappedChar = mappings[char.toUpperCase()];
return isLowerCase ? mappedChar.toLowerCase() : mappedChar;
```

---

### Issue: Hint calculations slow for long puzzles

**Solution**: Use `useMemo` to cache frequency calculations:

```tsx
const frequencyData = useMemo(
  () => calculateFrequency(puzzleText),
  [puzzleText] // Only recalculate when puzzle changes
);
```

---

### Issue: Cypress tests flaky

**Solution**: Use proper waits and intercepts:

```typescript
// ❌ Flaky (race condition)
cy.get("input").type("E");
cy.contains("THE");

// ✅ Stable (explicit wait)
cy.get("input").type("E");
cy.get('[data-testid="decrypted-text"]').should("contain", "THE");
```

---

## Deployment Checklist

Before merging to main:

- [ ] All tests passing locally
- [ ] Code reviewed (self-review at minimum)
- [ ] Constitution compliance verified
- [ ] No console errors in browser
- [ ] Mobile tested (375px, 768px, 1024px)
- [ ] Accessibility checked (keyboard + screen reader)
- [ ] Performance profiled (1000-char cryptogram <100ms)

---

## Next Steps After MVP

**Phase 2 (Future Enhancements)**:

- Add puzzle library (example cryptograms to try)
- Export/import puzzle state (JSON download/upload)
- Dark mode support (using existing Tailwind dark: classes)
- Undo/redo for mapping changes
- Keyboard shortcuts (e.g., Arrow keys to navigate grid)

**Not in current scope** (per spec clarifications):

- Cross-session persistence (localStorage/database)
- Multi-user features (sharing puzzles)
- Automatic solving (AI-powered)
- Authentication integration

---

## Time Estimates Summary

| Phase     | Task                                                      | Estimated Time |
| --------- | --------------------------------------------------------- | -------------- |
| 1         | Self-Contained Route File (all logic + components inline) | 3-4 hours      |
| 2         | Co-located Tests (unit + e2e)                             | 1.5 hours      |
| 3         | Polish & Quality Gates                                    | 30 min         |
| **Total** | **MVP Complete**                                          | **5-6 hours**  |

**Buffer**: Add 1-2 hours for unexpected issues, bringing realistic total to **6-7 hours**.

Much simpler than original estimate since everything is in one file following existing patterns!

---

## Success Criteria Validation

After implementation, verify success criteria from spec.md:

- [ ] **SC-001**: Enter cryptogram + start solving in <10 seconds ✓
- [ ] **SC-002**: Letter mappings update <100ms ✓
- [ ] **SC-003**: Complete 200-300 char cryptogram without bugs ✓
- [ ] **SC-004**: 90% first-attempt success (user testing) ⏳
- [ ] **SC-005**: 1000 char cryptogram performs well ✓
- [ ] **SC-006**: User reports intuitive vs pen-paper (feedback) ⏳

✓ = Testable during implementation
⏳ = Requires user feedback post-launch
