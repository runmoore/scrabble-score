# Research: Cryptogram URL Persistence (Updated for Refactoring)

**Feature**: 002-cryptogram-url-persistence
**Date**: 2026-01-07 (Updated after clarification and refactoring)
**Purpose**: Research technical decisions for URL-based state persistence in Remix with SSR

**IMPORTANT UPDATE (2026-01-07)**: Initial implementation used a Remix loader function, but this was refactored to use direct URL reading via `useSearchParams()` for simplicity. Loaders add unnecessary fetch overhead for client-available data like URL params. The simpler approach maintains SSR support while eliminating extra network requests.

## Research Questions

### 1. Server-Side Rendering for URL Parameters in Remix

**Question**: How should Remix loader functions handle URL query parameters for SSR?

**Decision**: Use Remix loader with `LoaderFunctionArgs` to read URL and return initial puzzle state

**Rationale**:

- Remix loaders run on server before page render
- Eliminates client-side content flash
- Critical for PWA/mobile performance
- Built-in to Remix - no additional dependencies
- Type-safe with `useLoaderData<typeof loader>()`

**Implementation Pattern**:

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
      initialPuzzle = ""; // Silent fallback
    }
  }

  return json({ initialPuzzle });
}

// In component
const { initialPuzzle } = useLoaderData<typeof loader>();
const [puzzleText, setPuzzleText] = useState(initialPuzzle);
```

**Alternatives Considered**:

- **Client-side only (current)**: Causes flash, poor mobile UX
- **Meta tags**: Can't handle dynamic puzzle content
- **Server components**: Not needed for this simple use case

### 2. Inline vs Abstracted URL Encoding

**Question**: Should URL encoding/decoding be abstracted into utility functions?

**Decision**: Inline directly - no separate utility file

**Rationale**:

- `encodeURIComponent`/`decodeURIComponent` are standard browser APIs
- Only used in 2 places (loader + client-side write)
- Utility wrapper adds no value - just calls the API
- Try-catch for decode is simple enough to inline
- Follows Constitution Principle VIII (avoid premature abstraction)

**Alternatives Considered**:

- **Utility functions**: Adds indirection without benefit
- **Custom encoding**: Reinventing the wheel
- **Library (query-string)**: Unnecessary dependency

**Implementation**:

```typescript
// Encoding (client-side URL write)
navigate(`?puzzle=${encodeURIComponent(puzzleText)}`, { replace: true });

// Decoding (server-side loader)
try {
  initialPuzzle = decodeURIComponent(puzzleParam);
} catch {
  initialPuzzle = "";
}
```

### 3. URL State Management in Remix

**Question**: What's the best practice for syncing React state with URL query parameters in Remix with SSR?

**Decision**: Loader for read (SSR), `useNavigate` with `replace: true` for write

**Rationale**:

- Loader provides initial state from URL (SSR)
- `useNavigate` with `replace: true` updates URL without adding history
- Prevents back button from navigating through every keystroke
- Works seamlessly with Remix's routing

**Implementation Pattern**:

```typescript
// Read (SSR + hydration)
const { initialPuzzle } = useLoaderData<typeof loader>();
const [puzzleText, setPuzzleText] = useState(initialPuzzle);

// Write (client-side updates)
const navigate = useNavigate();
useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (puzzleText) {
      navigate(`?puzzle=${encodeURIComponent(puzzleText)}`, { replace: true });
    } else {
      navigate("/cryptogram", { replace: true });
    }
  }, 300);
  return () => clearTimeout(timeoutId);
}, [puzzleText, navigate]);
```

### 4. Debouncing Strategy for URL Updates

**Question**: Should we debounce URL updates as the user types, and if so, what delay is appropriate?

**Decision**: Debounce URL updates with 300ms delay using React's `useEffect` cleanup function

**Rationale**: (Unchanged from original research)

- 300ms is standard, feels responsive
- Prevents excessive browser operations
- Uses React cleanup (no external library)
- URL updates quickly enough for mid-typing copy

### 5. URL Length and Browser Compatibility

**Question**: Will 1000 character puzzle text fit in URLs across all browsers?

**Decision**: Yes, safe. Worst case ~3000 chars after encoding.

**Rationale**: (Unchanged from original research)

- Modern browsers support 2048+ character URLs
- Worst-case 3x encoding expansion
- 1000 chars → ~3000 encoded, well within limits

### 6. Error Handling for Invalid URL Data

**Question**: How should we handle corrupted or invalid URL-encoded puzzle data?

**Decision**: Try-catch with silent fallback to empty string

**Rationale**: (Unchanged from original research)

- `decodeURIComponent()` throws on malformed data
- Graceful degradation - show empty puzzle
- Per FR-006: silent fallback, no error messages

**Implementation**:

```typescript
// Inline in loader
try {
  initialPuzzle = decodeURIComponent(puzzleParam);
} catch {
  initialPuzzle = "";
}
```

### 7. Testing Strategy

**Question**: What testing approach ensures URL persistence and SSR work correctly?

**Decision**: E2E tests only (Cypress) - no utility unit tests needed

**Rationale**:

- No utility functions to unit test (inlined)
- E2E tests verify full user workflows including SSR
- Can verify no content flash with Cypress
- Simpler test suite

**Test Coverage**:

**E2E Tests** (`cypress/e2e/cryptogram.cy.ts`):

- SSR behavior: puzzle in initial HTML (no flash)
- Enter puzzle → URL updates
- Load URL → puzzle displays (SSR)
- Refresh → puzzle persists
- Clear → URL clears
- Special chars/Unicode → preserved
- Corrupted URL → graceful fallback

## Summary of Decisions

| Decision Point     | Choice                                           | Key Reason                                   |
| ------------------ | ------------------------------------------------ | -------------------------------------------- |
| SSR Implementation | Remix loader with `LoaderFunctionArgs`           | Eliminates flash, better PWA UX              |
| URL Encoding       | Inline `encodeURIComponent`/`decodeURIComponent` | No abstraction needed (Principle VIII)       |
| State Management   | Loader for read + `useNavigate` for write        | SSR + client updates                         |
| Debounce Delay     | 300ms with `useEffect` cleanup                   | Balance of responsiveness and performance    |
| URL Length         | Accept 1000 char limit as-is                     | Safe with ~3x encoding expansion             |
| Error Handling     | Try-catch with silent fallback inline            | Graceful degradation                         |
| Testing Approach   | E2E only (no utility tests)                      | No utilities to test, full workflow coverage |

## Key Changes from Original Implementation

| Original                          | Fixed                       | Reason                      |
| --------------------------------- | --------------------------- | --------------------------- |
| Utility files (`url-encoding.ts`) | Inlined directly            | Avoid premature abstraction |
| Client-side only (useEffect)      | SSR loader + client updates | Eliminate content flash     |
| Unit tests for utilities          | E2E tests only              | No utilities to test        |

## No Open Questions

All technical decisions resolved. Ready for implementation of fixes.
