# Component Contracts: Cryptogram Solution Aid

**Feature**: 001-cryptogram-aid
**Date**: 2026-01-06
**Phase**: 1 - Design

**IMPORTANT**: Following the existing repo pattern (see `app/routes/anagram.tsx`), this feature will be **self-contained in a single route file** (`app/routes/cryptogram.tsx`). All components, functions, and types will be defined inline within the route file, not as separate modules.

---

## Route Component: `/cryptogram`

**File**: `app/routes/cryptogram.tsx`

**Structure**: Self-contained file with inline definitions (following `anagram.tsx` pattern):
- Type definitions at top
- Helper functions next
- Inline component definitions
- Main route component (default export)

### File Organization Pattern

```typescript
// app/routes/cryptogram.tsx

import { Form, useSearchParams } from "@remix-run/react";
import { useState, useMemo } from "react";

// ============================================================================
// TYPE DEFINITIONS (inline)
// ============================================================================

interface CryptogramState {
  puzzleText: string;
  mappings: Record<string, string>;
  hintsVisible: boolean;
}

// ... other types

// ============================================================================
// HELPER FUNCTIONS (inline)
// ============================================================================

function applyMappings(puzzleText: string, mappings: Record<string, string>): string {
  // Implementation
}

function calculateFrequency(text: string): FrequencyData {
  // Implementation
}

// ... other helpers

// ============================================================================
// INLINE COMPONENTS
// ============================================================================

function PuzzleInput({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  // Component implementation
}

function MappingGrid({ mappings, onMappingChange, conflictingLetters }: MappingGridProps) {
  // Component implementation
}

// ... other inline components

// ============================================================================
// MAIN ROUTE COMPONENT (default export)
// ============================================================================

export default function Cryptogram() {
  const [puzzleText, setPuzzleText] = useState<string>('');
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [hintsVisible, setHintsVisible] = useState<boolean>(false);

  // Component logic

  return (
    <>
      {/* JSX */}
    </>
  );
}
```

---

## Component Interfaces (Inline Components)

These components will be defined as functions within `cryptogram.tsx`, following the same pattern as `Letter` component in `anagram.tsx`.

### PuzzleInput (inline component)

### Props
```typescript
interface PuzzleInputProps {
  value: string;
  onChange: (text: string) => void;
  maxLength?: number; // Default: 1000 (per SC-005)
}
```

### Behavior
- Large textarea for puzzle input
- Paste support
- Character count display
- Validation: Error if >1000 chars (exceeds spec requirement SC-005)

### Example Usage
```tsx
<PuzzleInput
  value={puzzleText}
  onChange={setPuzzleText}
  maxLength={1000}
/>
```

---

## Component: `PuzzleDisplay`

**File**: `app/components/cryptogram/PuzzleDisplay.tsx`

### Props
```typescript
interface PuzzleDisplayProps {
  puzzleText: string;
  mappings: Record<string, string>;
}
```

### Behavior
- Displays two text blocks:
  1. **Original encrypted text** (top, muted color)
  2. **Decrypted text** (bottom, bold, solved letters highlighted)
- Case preservation per data model rules
- Monospace font for alignment
- Non-letter characters (spaces, punctuation) displayed as-is

### Derived Data
```typescript
const decryptedText = useMemo(
  () => applyMappings(puzzleText, mappings),
  [puzzleText, mappings]
);
```

### Example Usage
```tsx
<PuzzleDisplay
  puzzleText="HVWXYZ JKLMN"
  mappings={{ H: 'T', V: 'H', W: 'E' }}
/>
```

---

## Component: `MappingGrid`

**File**: `app/components/cryptogram/MappingGrid.tsx`

### Props
```typescript
interface MappingGridProps {
  mappings: Record<string, string>;
  onMappingChange: (cipher: string, plain: string) => void;
  onClearAll: () => void;
  conflictingLetters: string[]; // Cipher letters with conflicts
}
```

### Behavior
- Display 26 letter pairs (A-Z) in grid layout (4-5 rows)
- Each cell: cipher letter label + text input for plain letter
- Inputs:
  - `maxLength={1}`
  - `inputMode="text"`
  - Auto-uppercase on change
  - Highlight if letter is in `conflictingLetters` array
- "Clear All" button to reset all mappings

### Layout
```
A: [_]  B: [_]  C: [_]  D: [_]  E: [_]  F: [_]
G: [_]  H: [_]  I: [_]  J: [_]  K: [_]  L: [_]
M: [_]  N: [_]  O: [_]  P: [_]  Q: [_]  R: [_]
S: [_]  T: [_]  U: [_]  V: [_]  W: [_]  X: [_]
Y: [_]  Z: [_]
```

### Example Usage
```tsx
<MappingGrid
  mappings={{ Q: 'E', W: 'T', X: 'A' }}
  onMappingChange={handleMappingChange}
  onClearAll={handleClearAll}
  conflictingLetters={['Q', 'W']} // Both map to same letter
/>
```

---

## Component: `ConflictWarning`

**File**: `app/components/cryptogram/ConflictWarning.tsx`

### Props
```typescript
interface ConflictWarningProps {
  conflictingMappings: Array<{
    plainLetter: string;
    cipherLetters: string[];
  }>;
}
```

### Behavior
- Display warning message when conflicts detected
- List which cipher letters map to the same plain letter
- Non-blocking (informational only)
- Yellow/amber background with warning icon

### Example Usage
```tsx
<ConflictWarning
  conflictingMappings={[
    { plainLetter: 'E', cipherLetters: ['Q', 'W', 'X'] }
  ]}
/>
// Displays: "⚠️ Multiple letters (Q, W, X) are mapped to 'E'"
```

---

## Component: `HintSystem`

**File**: `app/components/cryptogram/HintSystem.tsx`

### Props
```typescript
interface HintSystemProps {
  visible: boolean;
  onToggle: () => void;
  puzzleText: string;
  mappings: Record<string, string>;
}
```

### Behavior
- Collapsible panel (initially hidden)
- Toggle button: "Show Hints" / "Hide Hints"
- When visible, displays three sections:
  1. **Frequency Table**: Cipher letters sorted by occurrence count
  2. **Letter Suggestions**: Common English letters not yet used
  3. **Top Unmapped Ciphers**: Most frequent cipher letters without mappings

### Derived Data
```typescript
const frequencyData = useMemo(
  () => calculateFrequency(puzzleText),
  [puzzleText]
);

const suggestions = useMemo(
  () => suggestCommonLetters(frequencyData, mappings),
  [frequencyData, mappings]
);
```

### Example Usage
```tsx
<HintSystem
  visible={hintsVisible}
  onToggle={() => setHintsVisible(!hintsVisible)}
  puzzleText={puzzleText}
  mappings={mappings}
/>
```

---

## Utility Functions: `app/utils/cryptogram.ts`

### `applyMappings`

```typescript
/**
 * Apply letter mappings to encrypted puzzle text
 * @param puzzleText - Original encrypted text
 * @param mappings - Cipher → plain letter mappings
 * @returns Decrypted text with case preservation
 */
export function applyMappings(
  puzzleText: string,
  mappings: Record<string, string>
): string;
```

### `calculateFrequency`

```typescript
/**
 * Calculate letter frequency counts (case-insensitive)
 * @param text - Puzzle text to analyze
 * @returns Frequency data with counts and sorted letters
 */
export function calculateFrequency(text: string): FrequencyData;
```

### `suggestCommonLetters`

```typescript
/**
 * Suggest likely plain letters for unmapped cipher letters
 * @param frequencyData - Letter frequency analysis
 * @param mappings - Current mappings
 * @returns Hint suggestions
 */
export function suggestCommonLetters(
  frequencyData: FrequencyData,
  mappings: Record<string, string>
): HintSuggestions;
```

### `detectConflicts`

```typescript
/**
 * Detect cipher letters mapping to the same plain letter
 * @param mappings - Current mappings
 * @returns Array of cipher letters involved in conflicts
 */
export function detectConflicts(
  mappings: Record<string, string>
): string[];
```

### `getConflictDetails`

```typescript
/**
 * Get detailed conflict information for warning display
 * @param mappings - Current mappings
 * @returns Array of conflict groups
 */
export function getConflictDetails(
  mappings: Record<string, string>
): Array<{ plainLetter: string; cipherLetters: string[] }>;
```

---

## Progressive Enhancement Strategy

### Without JavaScript (Fallback)

```tsx
<Form method="post">
  <input type="hidden" name="intent" value="applyMappings" />
  <input type="text" name="puzzleText" defaultValue={puzzleText} />

  {/* Mapping grid as form inputs */}
  <input type="text" name="mapping_A" maxLength={1} />
  <input type="text" name="mapping_B" maxLength={1} />
  {/* ... all 26 letters ... */}

  <button type="submit">Apply Mappings</button>
</Form>
```

**Server action** (if no JS):
```typescript
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'applyMappings') {
    // Parse mappings from form, return decrypted text
    // Set URL params to preserve state on reload
  }
}
```

### With JavaScript (Enhanced)

- No form submission, instant updates via `onChange`
- Hint system works via `useState` toggle
- No page reloads

---

## Testing Contracts

### Unit Test Expectations

**File**: `app/utils/cryptogram.test.ts`

```typescript
describe('applyMappings', () => {
  it('should apply mappings with case preservation', () => {
    expect(applyMappings('Hvwx', { H: 'T', V: 'H' }))
      .toBe('Thwx');
  });

  it('should ignore unmapped letters', () => {
    expect(applyMappings('ABC', { A: 'X' }))
      .toBe('XBC');
  });
});

describe('calculateFrequency', () => {
  it('should count letters case-insensitively', () => {
    const freq = calculateFrequency('AaA');
    expect(freq.counts['A']).toBe(3);
  });
});

describe('detectConflicts', () => {
  it('should detect multiple ciphers to same plain', () => {
    const conflicts = detectConflicts({ Q: 'E', W: 'E', X: 'A' });
    expect(conflicts).toContain('Q');
    expect(conflicts).toContain('W');
    expect(conflicts).not.toContain('X');
  });
});
```

### E2E Test Expectations

**File**: `cypress/e2e/cryptogram.cy.ts`

```typescript
describe('Cryptogram Solver', () => {
  it('should solve a cryptogram with mappings', () => {
    cy.visit('/cryptogram');
    cy.enterCryptogram('HVWX');
    cy.createMapping('H', 'T');
    cy.createMapping('V', 'H');
    cy.verifyDecryptedText('THwx'); // Partial solve
  });

  it('should show hints when requested', () => {
    cy.visit('/cryptogram');
    cy.enterCryptogram('EEETAA');
    cy.requestHints();
    cy.get('[data-testid="frequency-table"]').should('be.visible');
    cy.contains('E: 3'); // Most frequent
  });

  it('should warn on conflicts', () => {
    cy.visit('/cryptogram');
    cy.enterCryptogram('ABC');
    cy.createMapping('A', 'X');
    cy.createMapping('B', 'X'); // Conflict
    cy.get('[data-testid="conflict-warning"]').should('be.visible');
  });
});
```

---

## Accessibility Requirements

- All inputs have associated `<label>` elements
- Hint toggle button has `aria-expanded` attribute
- Conflict warnings have `role="alert"` for screen readers
- Keyboard navigation: Tab through mapping grid, Enter to toggle hints
- Color contrast meets WCAG AA standards (conflict highlighting uses both color + icon)
