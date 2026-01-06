# Data Model: Cryptogram Solution Aid

**Feature**: 001-cryptogram-aid
**Date**: 2026-01-06
**Phase**: 1 - Design

## Overview

This feature uses **client-side only** state management with no database persistence. All data structures are TypeScript types for React component state.

## Core Data Structures

### CryptogramState

The main state container for the cryptogram solver.

```typescript
interface CryptogramState {
  // The original encrypted puzzle text (immutable after input)
  puzzleText: string;

  // Letter mappings: cipher letter (uppercase) → plain letter (uppercase)
  // Example: { "Q": "E", "W": "T", "X": "A" }
  mappings: Record<string, string>;

  // Whether the hint system panel is visible
  hintsVisible: boolean;
}
```

**Validation Rules**:

- `puzzleText`: Non-empty string, max 1000 characters (per success criteria SC-005)
- `mappings`: Keys and values must be single uppercase letters A-Z
- `hintsVisible`: Boolean flag

**State Transitions**:

1. **Initial** → User enters puzzle text → `puzzleText` populated, `mappings` empty, `hintsVisible` false
2. **Solving** → User creates/modifies mappings → `mappings` updated, conflicts detected
3. **Stuck** → User requests hints → `hintsVisible` toggled to true
4. **Reset** → User clears all → `mappings` reset to `{}`, puzzle text remains

---

### Letter Mapping (Entry)

Individual cipher-to-plain letter association.

```typescript
interface LetterMapping {
  // Cipher letter (always uppercase A-Z)
  cipher: string;

  // Plain letter (always uppercase A-Z, or empty string if not mapped)
  plain: string;

  // Whether this mapping conflicts with another
  // (multiple cipher letters mapped to same plain letter)
  hasConflict: boolean;
}
```

**Derived Data**: `hasConflict` is computed from the full `mappings` dictionary using conflict detection algorithm.

---

### Frequency Data

Letter frequency counts for the cryptogram (used by hint system).

```typescript
interface FrequencyData {
  // Letter (uppercase A-Z) → occurrence count
  counts: Record<string, number>;

  // Letters sorted by frequency (descending)
  sortedLetters: Array<{
    letter: string;
    count: number;
    percentage: number; // Relative frequency as percentage
  }>;
}
```

**Computation**: Calculated on-demand when hint system is opened (not stored in state).

---

### Hint Suggestions

Suggested common letters for unmapped cipher letters.

```typescript
interface HintSuggestions {
  // Cipher letter → suggested plain letters (ordered by likelihood)
  suggestions: Record<string, string[]>;

  // Most frequent unmapped cipher letters
  topUnmappedCiphers: string[];

  // Most common English letters not yet used in mappings
  availableCommonLetters: string[];
}
```

**Common English Letter Order** (for suggestions):
`E, T, A, O, I, N, S, H, R, D, L, C, U, M, W, F, G, Y, P, B, V, K, J, X, Q, Z`

**Computation**: Generated when hint panel opened, combines frequency data with common English patterns.

---

## Derived Data (Computed, Not Stored)

### Decrypted Text

```typescript
function getDecryptedText(
  puzzleText: string,
  mappings: Record<string, string>
): string {
  return puzzleText
    .split("")
    .map((char) => {
      const upper = char.toUpperCase();
      if (/[A-Z]/.test(upper)) {
        const mapped = mappings[upper];
        if (mapped) {
          // Preserve original case
          return char === upper ? mapped : mapped.toLowerCase();
        }
      }
      // Non-letter or unmapped - return as-is
      return char;
    })
    .join("");
}
```

**Case Preservation**: If original char was lowercase, apply lowercase to mapped letter.

---

### Conflict List

```typescript
function getConflictingLetters(mappings: Record<string, string>): string[] {
  // Returns array of cipher letters involved in conflicts
  const reversed: Record<string, string[]> = {};

  for (const [cipher, plain] of Object.entries(mappings)) {
    if (!plain) continue; // Skip empty mappings
    if (!reversed[plain]) reversed[plain] = [];
    reversed[plain].push(cipher);
  }

  const conflicts: string[] = [];
  for (const [plain, ciphers] of Object.entries(reversed)) {
    if (ciphers.length > 1) {
      conflicts.push(...ciphers);
    }
  }

  return conflicts;
}
```

**Usage**: For visual highlighting and warning message.

---

## Data Flow

```
┌─────────────────┐
│  User Input     │
│  (Puzzle Text)  │
└────────┬────────┘
         │
         v
┌─────────────────────────────┐
│  CryptogramState            │
│  - puzzleText               │
│  - mappings: {}             │
│  - hintsVisible: false      │
└────────┬────────────────────┘
         │
         ├──> User creates mapping (e.g., Q → E)
         │
         v
┌─────────────────────────────┐
│  CryptogramState (updated)  │
│  - mappings: { Q: "E" }     │
└────────┬────────────────────┘
         │
         ├──> Compute decrypted text (derived)
         ├──> Detect conflicts (derived)
         │
         v
┌──────────────────────┐
│  Visual Update       │
│  - Puzzle display    │
│  - Mapping grid      │
│  - Conflict warning  │
└──────────────────────┘
         │
         ├──> User toggles hints
         │
         v
┌────────────────────────────┐
│  Compute Hint Data         │
│  - FrequencyData           │
│  - HintSuggestions         │
└────────────────────────────┘
         │
         v
┌──────────────────────┐
│  Hint Panel Display  │
│  - Frequency table   │
│  - Suggestions       │
└──────────────────────┘
```

---

## Storage & Persistence

**Storage**: None - all state is React component memory only

**Rationale**:

- Spec explicitly excludes cross-session persistence
- No database entities required
- State resets on page refresh (expected behavior)

**Future Enhancement** (if needed):

- Could add `localStorage` for session recovery on accidental refresh
- Could add URL state for sharing puzzles (query params)
- Not in current scope per clarifications

---

## Type Definitions File

Location: **Inline within `app/routes/cryptogram.tsx`** (following anagram.tsx pattern)

**Implementation Note**: Originally, explicit type definitions were planned for `CryptogramState` and `LetterMapping`, but these were removed during implementation as they were never used. The actual implementation uses individual `useState` hooks with TypeScript's type inference, making explicit interfaces unnecessary and keeping the code cleaner.

**Current Implementation** (User Story 1):

```typescript
// State managed via individual useState hooks
const [puzzleText, setPuzzleText] = useState(initialPuzzle); // inferred as string
const [mappings, setMappings] = useState<Record<string, string>>({}); // explicit generic

// Helper function signatures provide type safety
export function applyMappings(
  puzzleText: string,
  mappings: Record<string, string>
): string {
  /* ... */
}

export function getConflictingLetters(
  mappings: Record<string, string>
): string[] {
  /* ... */
}
```

**Planned for User Story 2** (Phase 4 - Inline Mapping Input):

```typescript
// Inline mapping UI state (Phase 4)
// Unique cipher letters extracted from puzzle text for inline input rendering
export function getUniqueCipherLetters(puzzleText: string): string[] {
  const letters = new Set<string>();
  for (const char of puzzleText) {
    const upper = char.toUpperCase();
    if (/[A-Z]/.test(upper)) {
      letters.add(upper);
    }
  }
  return Array.from(letters).sort();
}

// No additional state needed - inline inputs share the same mappings Record
// Synchronization happens naturally through React's single source of truth
```

**Future Enhancement** (002-cryptogram-hints - Frequency Analysis):

```typescript
// These will be added in a future feature when implementing hints
export interface FrequencyData {
  counts: Record<string, number>;
  sortedLetters: Array<{
    letter: string;
    count: number;
    percentage: number;
  }>;
}

export interface HintSuggestions {
  suggestions: Record<string, string[]>;
  topUnmappedCiphers: string[];
  availableCommonLetters: string[];
}

// Common English letter frequency order (constant)
export const COMMON_LETTERS = [
  "E",
  "T",
  "A",
  "O",
  "I",
  "N",
  "S",
  "H",
  "R",
  "D",
  "L",
  "C",
  "U",
  "M",
  "W",
  "F",
  "G",
  "Y",
  "P",
  "B",
  "V",
  "K",
  "J",
  "X",
  "Q",
  "Z",
] as const;
```

---

## Validation & Constraints

| Field              | Constraint                  | Error Handling                                          |
| ------------------ | --------------------------- | ------------------------------------------------------- |
| `puzzleText`       | Non-empty, max 1000 chars   | Show inline error message, disable mapping grid         |
| `mappings[key]`    | Single uppercase letter A-Z | Input validation: `maxLength={1}`, `pattern="[A-Za-z]"` |
| `mappings[value]`  | Single uppercase letter A-Z | Auto-uppercase on input, ignore non-letters             |
| Conflict detection | Allow but warn              | Non-blocking warning + visual highlight                 |

---

## Performance Considerations

- **State updates**: O(1) for single mapping change
- **Decrypted text computation**: O(n) where n = puzzle length (typical 100-500 chars)
- **Frequency calculation**: O(n) single pass
- **Conflict detection**: O(26) constant time
- **Re-render optimization**: Use `React.memo` for PuzzleDisplay if needed (unlikely)

All operations complete in <1ms for typical puzzle sizes, well under the <100ms latency budget.
