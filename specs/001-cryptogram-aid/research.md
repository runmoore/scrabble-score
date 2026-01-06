# Research: Cryptogram Solution Aid

**Feature**: 001-cryptogram-aid
**Date**: 2026-01-06
**Phase**: 0 - Research & Technology Decisions

## Research Areas

### 1. Client-Side State Management for Cryptogram Solving

**Decision**: Use React `useState` hooks with component-level state

**Rationale**:
- Feature is self-contained with no complex state sharing needs
- Component-level state is sufficient for: puzzle text, letter mappings (26-letter dictionary), hint visibility
- No need for Redux/Zustand - would add unnecessary complexity
- React hooks provide reactive updates automatically for instant mapping visualization

**Alternatives Considered**:
- **Context API**: Overkill for single-route feature with localized state
- **URL state (search params)**: Could enable sharing puzzle URLs, but spec explicitly excludes persistence
- **LocalStorage**: Rejected - spec clarified no cross-session persistence needed

**Implementation Notes**:
- Main state structure: `{ puzzleText: string, mappings: Record<string, string>, hintsVisible: boolean }`
- Derived state computed on render: decrypted text, frequency counts, conflicts

---

### 2. Letter Frequency Analysis Algorithm

**Decision**: Simple character counting with case-insensitive aggregation

**Rationale**:
- Cryptograms typically 100-500 chars - linear O(n) scanning is instant
- Standard English frequency order: E, T, A, O, I, N, S, H, R (for hint suggestions)
- Case-insensitive per spec clarification (Q and q count together)

**Algorithm**:
```typescript
function calculateFrequency(text: string): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const char of text.toUpperCase()) {
    if (/[A-Z]/.test(char)) {
      freq[char] = (freq[char] || 0) + 1;
    }
  }
  return freq;
}
```

**Alternatives Considered**:
- **Bigram/trigram analysis**: More sophisticated but spec only requests letter frequency
- **Caching**: Unnecessary - recalculation on 1000 chars is <1ms

---

### 3. Conflict Detection for Duplicate Mappings

**Decision**: Invert mapping dictionary to detect multiple cipher letters → same plain letter

**Rationale**:
- Real-time validation as user types
- Visual feedback (highlighting) + non-blocking warning (per spec clarification)
- O(26) check on each mapping change (negligible)

**Algorithm**:
```typescript
function detectConflicts(mappings: Record<string, string>): string[] {
  const reversed: Record<string, string[]> = {};
  for (const [cipher, plain] of Object.entries(mappings)) {
    if (!reversed[plain]) reversed[plain] = [];
    reversed[plain].push(cipher);
  }
  return Object.values(reversed)
    .filter(ciphers => ciphers.length > 1)
    .flat();
}
```

**Alternatives Considered**:
- **Prevent conflict on input**: Rejected - spec says "allow with warning"
- **Auto-clear previous mapping**: Rejected - user should decide

---

### 4. Progressive Enhancement Strategy

**Decision**: Form-based mapping grid with JavaScript enhancement

**Rationale**:
- Constitution requires progressive enhancement (Principle V)
- Base: 26 text inputs in form, submit updates all mappings
- Enhanced: `onChange` handlers for instant updates, no page reload
- Mobile: `inputMode="text"` + `maxLength={1}` for single-letter inputs

**Fallback Behavior (No JS)**:
- User fills mapping grid (standard HTML inputs)
- Clicks "Apply Mappings" button (form submission)
- Page reloads with query params, server renders decrypted text
- Hint system disabled (requires JS for toggle interaction)

**Enhanced Behavior (With JS)**:
- Instant updates on each keystroke
- Hint panel toggles without page reload
- Visual conflict highlighting
- Auto-focus next input after typing (UX improvement)

---

### 5. Hint System UI/UX Pattern

**Decision**: Collapsible panel below mapping grid, initially hidden

**Rationale**:
- Spec requires opt-in, hidden by default
- Collapsible/expandable pattern is familiar and accessible
- Contents when expanded:
  1. Frequency table (sorted high→low)
  2. Letter suggestions (unmapped common letters)
  3. "Most common cipher letters" list

**Accessibility**:
- `<details>` + `<summary>` for semantic collapsible (works without JS)
- ARIA labels: "Show hints", "Hide hints"
- Keyboard accessible (Enter/Space to toggle)

---

### 6. Tailwind CSS Styling Approach

**Decision**: Use existing Scrabble Score color palette + grid utilities

**Rationale**:
- Project already uses Tailwind with custom colors (blue-primary, green-primary, etc.)
- Mapping grid: `grid grid-cols-6 gap-2` (26 letters arranged in 4-5 rows)
- Conflict highlighting: `ring-2 ring-red-primary` (visual indicator)
- Puzzle display: Monospace font for cipher/plain letter alignment

**Component Styling**:
- **MappingGrid**: Card-style container, each letter pair in bordered cell
- **PuzzleDisplay**: Large monospace text, solved letters in different color
- **HintSystem**: Subtle border, collapsible animation
- **ConflictWarning**: Yellow/amber background with warning icon

---

### 7. Testing Strategy Details

**Unit Tests (Vitest)**:
- `app/utils/cryptogram.test.ts`:
  - `applyMappings()` - case preservation, partial mappings
  - `calculateFrequency()` - accuracy, empty text, special chars ignored
  - `suggestCommonLetters()` - correct order, excludes already mapped
  - `detectConflicts()` - multiple conflicts, no false positives

**E2E Tests (Cypress)**:
- `cypress/e2e/cryptogram.cy.ts`:
  - Full solve workflow (enter puzzle, map letters, verify updates)
  - Hint system toggle (hidden → visible → hidden)
  - Conflict warning appearance
  - Clear all mappings
  - Mobile viewport testing (375px width)

**Custom Commands**:
- `cy.enterCryptogram(text)` - Fill puzzle input + submit/trigger load
- `cy.createMapping(cipher, plain)` - Type into mapping grid cell
- `cy.requestHints()` - Toggle hint panel open
- `cy.verifyDecryptedText(expected)` - Assert puzzle display matches

---

## Technology Stack Summary

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Framework** | Remix 2.12.1 (React 18) | Existing project stack, no reason to deviate |
| **Styling** | Tailwind CSS | Project standard, utility-first approach |
| **State** | React hooks (useState) | Sufficient for component-local state |
| **Testing** | Vitest + Cypress | Constitution-mandated testing architecture |
| **Types** | TypeScript 5.x | Constitution Principle III (Type Safety First) |
| **Performance** | Client-side computation | No network latency, instant updates |

---

## Performance Considerations

**Constraint**: <100ms update latency (SC-002), support 1000 chars (SC-005)

**Analysis**:
- Letter mapping application: O(n) string traversal - ~0.1ms for 1000 chars
- Frequency calculation: O(n) single pass - ~0.2ms for 1000 chars
- Conflict detection: O(26) constant time - <0.01ms
- React re-render: ~10-20ms for text display update
- **Total**: <30ms end-to-end (well under 100ms budget)

**Optimization**: No special optimizations needed. Simple algorithms are fast enough.

---

## Open Questions (Resolved)

All technical decisions clarified. No blocking uncertainties remain.
