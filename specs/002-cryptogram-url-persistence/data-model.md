# Data Model: Cryptogram URL Persistence

**Feature**: 002-cryptogram-url-persistence
**Date**: 2026-01-07
**Purpose**: Define data structures and state management for URL-based puzzle persistence

## Overview

This feature uses **URL query parameters** as the sole persistence mechanism. No database changes are required. All data is ephemeral and exists only in:

1. Browser URL (encoded as query parameter)
2. React component state (during user session)

## Entities

### URL State (Query Parameters)

**Purpose**: Encode puzzle text in shareable URL format

**Structure**:

```
/cryptogram?puzzle={encoded_text}
```

**Fields**:

- `puzzle` (string, optional): URL-encoded puzzle text
  - Encoding: `encodeURIComponent(puzzleText)`
  - Max length: ~3000 characters (1000 chars raw × 3 worst-case expansion)
  - Character set: All Unicode (letters, numbers, punctuation, emojis, newlines)
  - Validation: Must be valid URL-encoded string

**Example**:

```
// Simple text
/cryptogram?puzzle=HELLO%20WORLD

// With newlines
/cryptogram?puzzle=LINE%20ONE%0ALINE%20TWO

// With special chars
/cryptogram?puzzle=It's%20%22quoted%22!

// Empty (no puzzle)
/cryptogram
```

### Component State

**Purpose**: Local React state for puzzle text during user session

**Type Definition**:

```typescript
interface CryptogramState {
  puzzleText: string; // Raw puzzle text (0-1000 chars)
  mappings: Record<string, string>; // Existing: letter mappings (not persisted)
}
```

**Validation Rules**:

- `puzzleText`:
  - Max length: 1000 characters (enforced by existing validation)
  - All characters allowed (letters, numbers, punctuation, spaces, newlines)
  - Empty string is valid (represents no puzzle)

**State Transitions**:

1. **Page Load**: URL puzzle param → `puzzleText` state
2. **User Types**: `puzzleText` state → debounced URL update (300ms)
3. **User Clears**: `puzzleText` state → URL clears (no query param)
4. **Page Refresh**: URL puzzle param → `puzzleText` state (persistence achieved)

## Data Flow

### Initial Load (from URL)

```
User navigates to /cryptogram?puzzle=ENCODED_TEXT
              ↓
    useSearchParams() reads query param
              ↓
    decodeURIComponent(encodedText)
              ↓
    setPuzzleText(decodedText)
              ↓
    Component renders with puzzle text
```

### URL Update (from user input)

```
User types in puzzle input
              ↓
    onChange handler updates puzzleText state
              ↓
    useEffect triggers (300ms debounce)
              ↓
    encodeURIComponent(puzzleText)
              ↓
    navigate(?puzzle=ENCODED, { replace: true })
              ↓
    URL updates without new history entry
```

### URL Clear (empty puzzle)

```
User clears puzzle input
              ↓
    onChange handler sets puzzleText = ""
              ↓
    useEffect triggers (300ms debounce)
              ↓
    navigate(/cryptogram, { replace: true })
              ↓
    URL query param removed
```

## Encoding/Decoding Utilities

**Module**: `app/utils/url-encoding.ts`

```typescript
/**
 * Encode puzzle text for URL safety
 * Handles Unicode, newlines, special characters
 */
export function encodePuzzleForUrl(text: string): string {
  return encodeURIComponent(text);
}

/**
 * Decode puzzle text from URL
 * Returns empty string if decoding fails (corrupted data)
 */
export function decodePuzzleFromUrl(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch (error) {
    console.warn("Failed to decode puzzle from URL:", error);
    return "";
  }
}

/**
 * Validate puzzle text length (existing 1000 char limit)
 */
export function isPuzzleTextValid(text: string): boolean {
  return text.length <= 1000;
}

/**
 * Estimate encoded URL length for validation
 * Worst case: 3x expansion for Unicode
 */
export function estimateEncodedLength(text: string): number {
  // Conservative estimate: assume 3x expansion
  return text.length * 3;
}
```

## Edge Cases

### 1. Malformed URL Data

**Scenario**: User manually edits URL to invalid encoding (e.g., `?puzzle=%E0%A4%A`)
**Handling**: `decodeURIComponent()` throws → catch error → fallback to empty puzzle
**User Experience**: Empty puzzle input, can start fresh

### 2. Extremely Long Puzzles

**Scenario**: User enters 1000 character puzzle (max limit)
**Handling**: Existing validation prevents input beyond 1000 chars, URL encoding stays within browser limits (~3000 chars)
**User Experience**: Character counter shows limit, URL updates successfully

### 3. Special Characters

**Scenario**: Puzzle contains quotes, apostrophes, newlines, emojis
**Handling**: `encodeURIComponent()` handles all Unicode characters
**User Experience**: Text preserves exactly through encode/decode cycle

### 4. Empty Puzzle

**Scenario**: User clears puzzle input
**Handling**: URL updates to `/cryptogram` (no query param)
**User Experience**: Clean URL, ready for new puzzle

### 5. Rapid Typing

**Scenario**: User types quickly, many state updates
**Handling**: 300ms debounce prevents excessive URL updates
**User Experience**: Smooth typing, URL updates after pause

## No Database Changes

**Confirmation**: This feature requires **ZERO database modifications**:

- No new tables
- No new columns
- No schema migrations
- No Prisma model changes

All data exists transiently in:

1. Browser URL (shareable)
2. React state (session-only)

This aligns with the specification requirement: "no database persistence".

## State Management Summary

| Data            | Storage Location | Lifetime          | Shareable         |
| --------------- | ---------------- | ----------------- | ----------------- |
| Puzzle Text     | URL query param  | Until URL changes | ✅ Yes            |
| Puzzle Text     | React state      | Current session   | ❌ No             |
| Letter Mappings | React state      | Current session   | ❌ No (by design) |

## Validation Rules Summary

| Field                | Min Length | Max Length | Character Set | Required |
| -------------------- | ---------- | ---------- | ------------- | -------- |
| puzzleText (raw)     | 0          | 1000       | All Unicode   | No       |
| puzzleText (encoded) | 0          | ~3000      | URL-safe      | No       |
| URL query param      | 0          | ~3000      | URL-safe      | No       |

## Ready for Contracts Phase

All entities defined, no open questions. Data model is simple and requires no backend/database work.
