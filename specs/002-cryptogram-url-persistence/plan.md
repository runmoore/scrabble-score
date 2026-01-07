# Implementation Plan: Cryptogram URL Persistence

**Branch**: `002-cryptogram-url-persistence` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-cryptogram-url-persistence/spec.md`

**FINAL IMPLEMENTATION NOTE (2026-01-07)**: After initial implementation with loader function, simplified to direct URL reading via `useSearchParams()`. This approach eliminates unnecessary fetch overhead while maintaining SSR support. See Implementation History section for full evolution.

## Summary

Enable cryptogram puzzle shareability and page-reload persistence by encoding puzzle text in URL query parameters. Users can share puzzles via URL, and puzzle text persists through page refreshes without requiring database storage. The URL automatically updates as users type, ensuring the address bar always reflects the current puzzle state.

**Key capabilities:**

- Share cryptograms via URL (copy/paste to friends)
- Page refresh preserves puzzle text
- URL updates dynamically as user types (300ms debounce)
- Server-side rendering eliminates content flash
- Simple inline implementation (no utility abstraction)

## Technical Context

**Language/Version**: TypeScript 5.x (existing project stack)
**Primary Dependencies**: React 18, Remix 2.12.1 (Indie Stack with SSR support)
**Storage**: N/A (session-only, no database persistence)
**Testing**: Cypress (e2e), Vitest (if utilities exist)
**Target Platform**: Progressive Web App (PWA) for mobile browsers, specifically iPhone
**Project Type**: Web application (Remix full-stack with SSR)
**Performance Goals**: Instantaneous page load with puzzle pre-rendered (SSR), no content flash
**Constraints**: 1000 character puzzle limit (existing), SSR must work for PWA/mobile
**Scale/Scope**: Single-page feature enhancement, ~100-150 LOC total

## Constitution Check

_GATE: Must pass before implementation._

### I. Test-First Development

- **Status**: ✅ PASS
- **Plan**: Cypress e2e tests for URL shareability and page refresh scenarios

### II. Code Quality Gates

- **Status**: ✅ PASS
- **Plan**: Run `npm run lint`, `npm run typecheck`, `npm run format` before completion

### III. Type Safety First

- **Status**: ✅ PASS
- **Plan**: Loader return type explicit, inline encoding maintains type safety

### IV. Server-Side Security

- **Status**: ✅ PASS (N/A)
- **Plan**: No auth needed - public cryptogram URLs

### V. Progressive Enhancement

- **Status**: ✅ PASS
- **Plan**: SSR improves progressive enhancement - works before JS loads

### VI. PWA-First Mobile Design

- **Status**: ✅ PASS
- **Plan**: SSR critical for mobile PWA - eliminates flash on slow connections

### VII. Database Schema Integrity

- **Status**: ✅ PASS (N/A)
- **Plan**: No database changes required

### VIII. Avoid Premature Abstraction

- **Status**: ✅ PASS
- **Plan**: Inline encoding/decoding directly - no separate utility files

**Overall Gate Status**: ✅ PASS - All principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/002-cryptogram-url-persistence/
├── plan.md              # This file
├── research.md          # Technical decisions
├── spec.md              # Feature specification
├── quickstart.md        # Developer guide
└── tasks.md             # Implementation tasks
```

### Source Code

```text
app/
└── routes/
    └── cryptogram.tsx      # MODIFY: Add loader for SSR, inline URL encoding

cypress/
└── e2e/
    └── cryptogram.cy.ts    # MODIFY: Add URL persistence tests
```

**Structure Decision**: Remix single-project structure with file-based routing. This is a focused enhancement to the existing `/cryptogram` route. All URL logic is inline in the route file where it's used - no separate utility abstraction needed.

## Implementation Approach

### Core Implementation

**Remix Loader (Server-Side Rendering)**:

```typescript
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const puzzleParam = url.searchParams.get("puzzle");

  let initialPuzzle = "";
  if (puzzleParam) {
    try {
      initialPuzzle = decodeURIComponent(puzzleParam);
    } catch {
      initialPuzzle = ""; // Silent fallback per FR-006
    }
  }

  return json({ initialPuzzle });
}
```

**Component (Client-Side Updates)**:

```typescript
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";

export default function Cryptogram() {
  // Initialize from SSR loader data
  const { initialPuzzle } = useLoaderData<typeof loader>();
  const [puzzleText, setPuzzleText] = useState(initialPuzzle);
  const navigate = useNavigate();

  // Write to URL with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (puzzleText) {
        navigate(`?puzzle=${encodeURIComponent(puzzleText)}`, {
          replace: true,
        });
      } else {
        navigate("/cryptogram", { replace: true });
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [puzzleText, navigate]);

  // ... rest of component
}
```

**Key decisions:**

- **SSR via loader**: Eliminates content flash, puzzle pre-populated in HTML
- **Inline encoding**: `encodeURIComponent`/`decodeURIComponent` used directly
- **No utility abstraction**: Follows Constitution Principle VIII - these are trivial wrappers
- **300ms debounce**: Balance of responsiveness and performance
- **Silent error handling**: Malformed URLs gracefully fall back to empty puzzle

### Testing Strategy

**E2E Tests (Cypress)** - `cypress/e2e/cryptogram.cy.ts`:

- Enter puzzle → URL updates
- Load URL with puzzle → puzzle displays (verify SSR)
- Refresh page → puzzle persists
- Clear puzzle → URL clears
- Special characters/Unicode → preserved
- Corrupted URL → graceful fallback
- Dynamic URL updates as user types

**No utility unit tests needed** - encoding/decoding logic is inline and simple

## Implementation History

### Initial Implementation (Completed)

- ✅ Created URL encoding utilities (`app/utils/url-encoding.ts`)
- ✅ Added unit tests for utilities
- ✅ Implemented client-side URL sync with useEffect
- ✅ Added Cypress e2e tests
- ✅ All tests passing

**Status**: Feature working, all 3 user stories functional

### Clarifications (2026-01-07)

During post-implementation review, identified two improvements:

1. **SSR Requirement** (FR-011):

   - Current: Client-side only causes content flash
   - Needed: SSR to pre-populate puzzle in HTML
   - Impact: Critical for PWA/mobile UX

2. **Premature Abstraction** (Principle VIII violation):
   - Current: Utility files wrap built-in APIs
   - Needed: Inline encoding/decoding directly
   - Impact: Simpler, more maintainable code

### Refinements (Completed)

**Phase 1: Remove Abstraction**
1. ✅ Deleted `app/utils/url-encoding.ts` and tests (~130 LOC removed)
2. ✅ Removed utility imports from cryptogram route

**Phase 2: Add SSR (Initial Approach)**
1. ✅ Initially implemented Remix loader function for SSR
2. ✅ Initialized state from loader data
3. ✅ Inlined encoding/decoding

**Phase 3: Simplify (Final Approach)**
1. ✅ Removed loader function (unnecessary overhead for URL params)
2. ✅ Simplified to direct `useSearchParams()` reading
3. ✅ Added try-catch for error handling
4. ✅ Maintains SSR support without extra fetches

**Final result:**
- Simplest possible implementation
- SSR works (no content flash)
- No extra network requests
- Constitution compliant
- All functionality maintained

**Key insight:** The original pattern of reading `searchParams.get("puzzle")` directly was correct all along! It works during SSR because Remix's `useSearchParams()` provides URL context on both server and client. The only addition needed was error handling for `decodeURIComponent()`.

## Success Criteria

**Feature is successful when:**

- ✅ Users can share cryptogram URLs (copy/paste works)
- ✅ Page refresh preserves puzzle text (SSR + URL)
- ✅ URL updates dynamically as user types (300ms debounce)
- ✅ No content flash on page load (SSR)
- ✅ Works on mobile PWA (iPhone primary target)
- ✅ All e2e tests passing
- ✅ Constitution Principle VIII compliant (no premature abstraction)
- ✅ Code quality gates pass (lint, typecheck, format)

## Next Steps

1. Run `/speckit.tasks` to generate task breakdown for refinements
2. Implement refinements (delete utilities, add SSR)
3. Verify all tests pass
4. Deploy and validate on mobile PWA
