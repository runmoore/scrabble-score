# Quickstart: Cryptogram URL Persistence

**Feature**: 002-cryptogram-url-persistence
**Branch**: `002-cryptogram-url-persistence`
**Prerequisites**: Node.js 18+, npm 8+

## Purpose

This guide helps developers implement and test URL-based persistence for cryptogram puzzles. After this feature, users can:

- Share cryptogram puzzles via URL
- Refresh the page without losing their puzzle
- Copy URLs mid-typing and they'll stay in sync

## Setup

### 1. Branch and Environment

```bash
# Ensure you're on the feature branch
git checkout 002-cryptogram-url-persistence

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The app should be running at `http://localhost:3000`

### 2. Navigate to Cryptogram Page

Open browser to: `http://localhost:3000/cryptogram`

**Current Behavior** (before implementation):

- Enter puzzle text → URL stays as `/cryptogram`
- Refresh page → puzzle text is lost
- Cannot share puzzle via URL

**Target Behavior** (after implementation):

- Enter puzzle text → URL updates to `/cryptogram?puzzle=ENCODED_TEXT`
- Refresh page → puzzle text persists
- Share URL → friend sees same puzzle

## Implementation Checklist

### Step 1: Create URL Encoding Utilities

**File**: `app/utils/url-encoding.ts`

**Tasks**:

- [ ] Create `encodePuzzleForUrl(text: string): string` function
- [ ] Create `decodePuzzleFromUrl(encoded: string): string` function
- [ ] Create `isPuzzleTextValid(text: string, maxLength?: number): boolean` function
- [ ] Create `estimateEncodedLength(text: string): number` function
- [ ] Add try-catch error handling in decode function

**Test**:

```bash
npm test -- url-encoding
```

### Step 2: Add Unit Tests for Utilities

**File**: `app/utils/url-encoding.test.ts`

**Tasks**:

- [ ] Test encode/decode with basic text
- [ ] Test encode/decode with newlines
- [ ] Test encode/decode with Unicode/emojis
- [ ] Test encode/decode with special characters
- [ ] Test error handling for malformed data
- [ ] Test validation function
- [ ] Test estimated length calculation

**Test**:

```bash
npm test -- url-encoding.test
```

### Step 3: Update Cryptogram Component

**File**: `app/routes/cryptogram.tsx`

**Tasks**:

- [ ] Import `useNavigate` from `@remix-run/react`
- [ ] Import URL encoding utilities
- [ ] Add `useEffect` to read puzzle from URL on mount
- [ ] Add `useEffect` to sync puzzle text to URL (debounced 300ms)
- [ ] Handle empty puzzle (clear URL param)
- [ ] Add error handling for URL decode

**Key Code Additions**:

```typescript
import { useNavigate, useSearchParams, Form } from "@remix-run/react";
import { encodePuzzleForUrl, decodePuzzleFromUrl } from "~/utils/url-encoding";

// In component:
const navigate = useNavigate();
const [searchParams] = useSearchParams();

// Read from URL on mount
useEffect(() => {
  const puzzleParam = searchParams.get("puzzle");
  if (puzzleParam) {
    const decoded = decodePuzzleFromUrl(puzzleParam);
    if (decoded) {
      setPuzzleText(decoded);
    }
  }
}, [searchParams]);

// Write to URL on change (debounced)
useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (puzzleText) {
      const encoded = encodePuzzleForUrl(puzzleText);
      navigate(`?puzzle=${encoded}`, { replace: true });
    } else {
      navigate("/cryptogram", { replace: true });
    }
  }, 300);
  return () => clearTimeout(timeoutId);
}, [puzzleText, navigate]);
```

### Step 4: Add Component Tests

**File**: `app/routes/cryptogram.test.tsx`

**Tasks**:

- [ ] Test URL loads puzzle on mount
- [ ] Test puzzle updates URL
- [ ] Test empty puzzle clears URL
- [ ] Test invalid URL data doesn't crash

**Test**:

```bash
npm test -- cryptogram.test
```

### Step 5: Add Cypress Custom Commands

**File**: `cypress/support/commands.ts`

**Tasks**:

- [ ] Add `cy.enterCryptogramPuzzle(text: string)` command
- [ ] Add `cy.verifyPuzzleInUrl(text: string)` command
- [ ] Add `cy.loadCryptogramFromUrl(text: string)` command

**Example**:

```typescript
Cypress.Commands.add("enterCryptogramPuzzle", (text: string) => {
  cy.visit("/cryptogram");
  cy.get('[name="puzzle"]').clear().type(text);
  cy.wait(400); // Wait for debounce
});

Cypress.Commands.add("verifyPuzzleInUrl", (text: string) => {
  const encoded = encodeURIComponent(text);
  cy.url().should("include", `puzzle=${encoded}`);
});
```

### Step 6: Add E2E Tests

**File**: `cypress/e2e/cryptogram.cy.ts`

**Tasks**:

- [ ] Test entering puzzle updates URL
- [ ] Test loading URL displays puzzle
- [ ] Test page refresh persists puzzle
- [ ] Test clearing puzzle clears URL
- [ ] Test typing updates URL after debounce
- [ ] Test sharing URL between tabs

**Test**:

```bash
npm run test:e2e:run
```

### Step 7: Run Quality Gates

```bash
# Lint
npm run lint

# Type check
npm run typecheck

# Format
npm run format

# All tests
npm test -- --run
npm run test:e2e:run
```

## Manual Testing

### Test Case 1: Enter Puzzle → URL Updates

1. Navigate to `/cryptogram`
2. Enter puzzle text: `HELLO WORLD`
3. Wait 300ms
4. **Verify**: URL shows `/cryptogram?puzzle=HELLO%20WORLD`

### Test Case 2: Load Puzzle from URL

1. Navigate to `/cryptogram?puzzle=SECRET%20MESSAGE`
2. **Verify**: Puzzle input shows `SECRET MESSAGE`

### Test Case 3: Page Refresh Persistence

1. Enter puzzle: `SOME TEXT`
2. Wait for URL update
3. Refresh page (Cmd+R or F5)
4. **Verify**: Puzzle still shows `SOME TEXT`

### Test Case 4: Share URL

1. Enter puzzle: `SHARE THIS`
2. Copy URL from address bar
3. Open new incognito tab
4. Paste URL and navigate
5. **Verify**: New tab shows `SHARE THIS`

### Test Case 5: Clear Puzzle

1. Enter puzzle: `DELETE ME`
2. Wait for URL update
3. Clear all text from puzzle input
4. Wait 300ms
5. **Verify**: URL is `/cryptogram` (no query param)

### Test Case 6: Special Characters

1. Enter puzzle with newlines:
   ```
   LINE ONE
   LINE TWO
   ```
2. Wait for URL update
3. Refresh page
4. **Verify**: Newlines preserved in puzzle

### Test Case 7: Unicode/Emoji

1. Enter puzzle: `Hello 😀 World`
2. Wait for URL update
3. Copy URL and open in new tab
4. **Verify**: Emoji displays correctly

### Test Case 8: Mobile Device (iPhone)

1. Open app on iPhone (or iPhone simulator)
2. Enter puzzle text
3. Add to home screen (if not already)
4. Close and reopen from home screen
5. **Verify**: Works as PWA, URL persistence intact

## Common Issues & Troubleshooting

### Issue: URL not updating

**Check**:

- Is debounce working? (Wait 300ms after typing)
- Check browser console for errors
- Verify `useNavigate` is imported from `@remix-run/react`

**Fix**:

```typescript
// Make sure navigate is called with replace: true
navigate(`?puzzle=${encoded}`, { replace: true });
```

### Issue: Puzzle text corrupted after reload

**Check**:

- Are you using `encodeURIComponent` / `decodeURIComponent`?
- Check for double-encoding

**Fix**:

```typescript
// Encode once
const encoded = encodeURIComponent(text);

// Decode once
const decoded = decodeURIComponent(encoded);
```

### Issue: Newlines not preserving

**Check**:

- Are newlines being encoded? (`\n` → `%0A`)
- Check if decode is working correctly

**Fix**:
Verify `encodeURIComponent` is used (not `encodeURI`)

### Issue: URL too long

**Check**:

- Is puzzle text > 1000 characters?
- Existing validation should prevent this

**Fix**:
Existing character counter should show error. If bypassed, verify validation:

```typescript
if (text.length > 1000) {
  // Show error
}
```

### Issue: Tests failing

**Check**:

- Run `npm run lint` and fix errors
- Run `npm run typecheck` and fix type errors
- Check Cypress videos in `cypress/videos/` for e2e failures

**Fix**:

- Unit tests: Check utility functions match contracts
- E2e tests: Verify debounce wait times (300ms + margin)

## Performance Verification

### Check URL Update Performance

1. Open browser DevTools → Performance tab
2. Start recording
3. Type in puzzle input
4. Stop recording after URL updates
5. **Verify**: URL update takes < 50ms

### Check Page Load Performance

1. Navigate to URL with puzzle: `/cryptogram?puzzle=TEST`
2. Open DevTools → Network tab
3. Refresh page
4. **Verify**: Page loads in < 1 second

## Next Steps

After completing this checklist:

1. Run `/speckit.tasks` to generate detailed implementation tasks
2. Implement tasks in priority order (P1 → P2 → P3)
3. Create PR when all tests pass
4. Request code review

## Reference Documentation

- [Spec](./spec.md) - Feature requirements
- [Research](./research.md) - Technical decisions
- [Data Model](./data-model.md) - State structure
- [Contracts](./contracts/client-side.md) - API contracts
- [Plan](./plan.md) - Implementation plan

## Success Criteria (from Spec)

- ✅ Users can share cryptogram puzzles by copying the URL, and recipients see exact same puzzle 100% of the time
- ✅ Users who refresh the page see the puzzle persist without data loss 100% of the time
- ✅ URL encoding supports all valid puzzle characters (letters, numbers, punctuation, Unicode) without corruption
- ✅ Users can successfully share cryptograms with puzzles up to 1000 character limit via URL
- ✅ Puzzle loading from URL feels instantaneous (no perceptible delay)
- ✅ Invalid or corrupted URL data fails gracefully without breaking the page
