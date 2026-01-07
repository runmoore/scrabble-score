# Client-Side Contracts: Cryptogram URL Persistence

**Feature**: 002-cryptogram-url-persistence
**Date**: 2026-01-07
**Type**: Client-side TypeScript interfaces and utility contracts

## Overview

This feature has **no API endpoints** - it's purely client-side URL state management. This document defines the TypeScript contracts for the utility functions and React hooks.

## Utility Function Contracts

### URL Encoding Functions

**Module**: `app/utils/url-encoding.ts`

```typescript
/**
 * Encode puzzle text for URL safety
 *
 * @param text - Raw puzzle text (any Unicode characters)
 * @returns URL-safe encoded string
 *
 * @example
 * encodePuzzleForUrl("Hello World") // "Hello%20World"
 * encodePuzzleForUrl("Line 1\nLine 2") // "Line%201%0ALine%202"
 * encodePuzzleForUrl("😀") // "%F0%9F%98%80"
 */
export function encodePuzzleForUrl(text: string): string;

/**
 * Decode puzzle text from URL
 *
 * @param encoded - URL-encoded string
 * @returns Decoded puzzle text, or empty string if decoding fails
 *
 * @example
 * decodePuzzleFromUrl("Hello%20World") // "Hello World"
 * decodePuzzleFromUrl("Line%201%0ALine%202") // "Line 1\nLine 2"
 * decodePuzzleFromUrl("%E0%A4%A") // "" (invalid, returns empty)
 *
 * @remarks
 * Returns empty string on decode error rather than throwing.
 * This provides graceful degradation for corrupted URLs.
 */
export function decodePuzzleFromUrl(encoded: string): string;

/**
 * Validate puzzle text length against limit
 *
 * @param text - Raw puzzle text
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns true if text is within limit
 *
 * @example
 * isPuzzleTextValid("short") // true
 * isPuzzleTextValid("a".repeat(1001)) // false
 */
export function isPuzzleTextValid(text: string, maxLength?: number): boolean;

/**
 * Estimate encoded URL length for validation
 *
 * @param text - Raw puzzle text
 * @returns Estimated length after URL encoding (worst case: 3x)
 *
 * @example
 * estimateEncodedLength("Hello") // 15 (5 * 3)
 * estimateEncodedLength("😀") // 12 (1 char, but 4 bytes UTF-8 * 3)
 *
 * @remarks
 * Conservative estimate assumes worst-case 3x expansion.
 * Actual expansion varies: ASCII ~1x, Unicode ~3x.
 */
export function estimateEncodedLength(text: string): number;
```

## React Hook Contracts

### URL Sync Hook (Implementation)

**Module**: `app/routes/cryptogram.tsx` (internal hook, not exported)

```typescript
/**
 * Custom hook for syncing puzzle text with URL
 *
 * @param puzzleText - Current puzzle text from React state
 * @param setPuzzleText - State setter for puzzle text
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 *
 * @remarks
 * - Reads puzzle from URL on mount
 * - Updates URL when puzzleText changes (debounced)
 * - Uses navigate with replace: true (no history pollution)
 * - Clears URL param when puzzleText is empty
 *
 * @example
 * const [puzzleText, setPuzzleText] = useState("");
 * usePuzzleUrlSync(puzzleText, setPuzzleText);
 */
function usePuzzleUrlSync(
  puzzleText: string,
  setPuzzleText: (text: string) => void,
  debounceMs?: number
): void;
```

## URL Query Parameter Contract

### Query Parameter Specification

**Route**: `/cryptogram`

**Query Parameters**:

| Parameter | Type   | Required | Description             | Example                 |
| --------- | ------ | -------- | ----------------------- | ----------------------- |
| `puzzle`  | string | No       | URL-encoded puzzle text | `?puzzle=HELLO%20WORLD` |

**Format**:

```
/cryptogram                           # No puzzle (empty state)
/cryptogram?puzzle={encoded_text}     # Puzzle loaded
```

**Encoding Rules**:

- Use `encodeURIComponent()` for encoding
- Use `decodeURIComponent()` for decoding
- All Unicode characters supported
- Max encoded length: ~3000 characters
- Max raw length: 1000 characters (enforced by app)

**Examples**:

```typescript
// Simple text
"/cryptogram?puzzle=HELLO%20WORLD";
// Decodes to: "HELLO WORLD"

// Multi-line text
"/cryptogram?puzzle=LINE%20ONE%0ALINE%20TWO";
// Decodes to: "LINE ONE\nLINE TWO"

// Special characters
"/cryptogram?puzzle=It's%20%22quoted%22!";
// Decodes to: "It's \"quoted\"!"

// Unicode/Emoji
"/cryptogram?puzzle=%F0%9F%98%80%20Hello";
// Decodes to: "😀 Hello"

// Empty puzzle
"/cryptogram";
// No puzzle parameter
```

## Component Interface Changes

### PuzzleInput Component

**Existing Props** (no changes):

```typescript
interface PuzzleInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number; // default: 1000
}
```

**Behavior Change**:

- `onChange` now triggers debounced URL update
- No prop changes needed - URL sync is internal to parent component

### Main Component State

**Existing State** (no changes to structure):

```typescript
interface CryptogramState {
  puzzleText: string;
  mappings: Record<string, string>;
}
```

**New Behavior**:

- `puzzleText` initialized from URL on mount
- `puzzleText` updates URL on change (debounced)
- `mappings` not persisted (by design)

## Error Handling Contracts

### Decode Error Handling

```typescript
type DecodeResult =
  | {
      success: true;
      text: string;
    }
  | {
      success: false;
      error: Error;
      fallback: string; // Always ""
    };
```

**Behavior**:

- If `decodeURIComponent()` succeeds → return decoded text
- If `decodeURIComponent()` throws → return empty string
- No user-facing error message (silent recovery)
- Log warning to console for debugging

### Validation Error Handling

```typescript
type ValidationResult = {
  valid: boolean;
  reason?: string;
};
```

**Validation Checks**:

1. Length check: `text.length <= maxLength`
2. Encoded length estimate: `estimateEncodedLength(text) <= 8000` (conservative browser limit)

**Current Behavior** (existing):

- Character counter shows red when over limit
- Form disable/enable based on validation
- No changes needed - existing validation sufficient

## Browser Compatibility

### Required Browser APIs

| API                    | Purpose            | Minimum Version     |
| ---------------------- | ------------------ | ------------------- |
| `encodeURIComponent()` | Encode puzzle text | All browsers (ES3+) |
| `decodeURIComponent()` | Decode puzzle text | All browsers (ES3+) |
| `URLSearchParams`      | Read query params  | All modern browsers |
| `useNavigate` (Remix)  | Update URL         | React Router v6+    |
| `useEffect`            | Sync state to URL  | React 16.8+         |

**Target Browsers** (from PWA requirements):

- Safari iOS 15+ (iPhone primary target)
- Chrome 90+
- Firefox 90+
- Edge 90+

All required APIs are available in these versions.

## TypeScript Type Definitions

### Complete Type File

**File**: `app/utils/url-encoding.ts`

```typescript
/**
 * URL encoding utilities for cryptogram puzzle persistence
 */

export type PuzzleText = string;
export type EncodedPuzzleText = string;

export interface EncodingOptions {
  /** Maximum length for raw puzzle text */
  maxLength?: number;
  /** Maximum estimated encoded length */
  maxEncodedLength?: number;
}

export interface ValidationResult {
  valid: boolean;
  reason?: "too_long" | "encoded_too_long" | "invalid_chars";
}

export function encodePuzzleForUrl(text: PuzzleText): EncodedPuzzleText;
export function decodePuzzleFromUrl(encoded: EncodedPuzzleText): PuzzleText;
export function isPuzzleTextValid(
  text: PuzzleText,
  maxLength?: number
): boolean;
export function estimateEncodedLength(text: PuzzleText): number;
export function validatePuzzle(
  text: PuzzleText,
  options?: EncodingOptions
): ValidationResult;
```

## Testing Contracts

### Unit Test Coverage

**Required Tests** (`app/utils/url-encoding.test.ts`):

- ✅ Encode basic ASCII text
- ✅ Encode text with spaces
- ✅ Encode text with newlines
- ✅ Encode Unicode characters
- ✅ Encode emojis
- ✅ Encode special characters (quotes, ampersands)
- ✅ Decode basic encoded text
- ✅ Decode with special characters
- ✅ Handle decode errors gracefully
- ✅ Validate text length
- ✅ Estimate encoded length
- ✅ Round-trip encode/decode preserves text

### E2E Test Coverage

**Required Tests** (`cypress/e2e/cryptogram.cy.ts`):

- ✅ Enter puzzle → verify URL updates
- ✅ Load URL with puzzle → verify puzzle displays
- ✅ Refresh page → verify puzzle persists
- ✅ Clear puzzle → verify URL clears
- ✅ Type continuously → verify debounced URL update
- ✅ Share URL to new tab → verify puzzle transfers
- ✅ Invalid URL data → verify graceful fallback

## No API Contracts

**Confirmation**: This feature has:

- ❌ No REST API endpoints
- ❌ No GraphQL queries/mutations
- ❌ No server-side routes
- ❌ No database operations
- ❌ No network requests

All contracts are client-side TypeScript interfaces and browser APIs.
