# Tasks: Cryptogram URL Persistence Refinements

**Input**: Design documents from `/specs/002-cryptogram-url-persistence/`
**Prerequisites**: plan.md, spec.md, research.md

**Context**: Initial implementation complete and working. These tasks refine the implementation to:

1. Remove premature abstraction (Constitution Principle VIII)
2. Add SSR support (FR-011)

**Status**: Feature is functional. These are refinement tasks to improve quality.

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

---

## Phase 1: Remove Premature Abstraction

**Purpose**: Delete utility files, inline encoding/decoding directly per Constitution Principle VIII

- [x] T001 Delete app/utils/url-encoding.ts file
- [x] T002 Delete app/utils/url-encoding.test.ts file
- [x] T003 Remove utility imports from app/routes/cryptogram.tsx
- [x] T004 Run npm test -- --run to verify no broken imports

---

## Phase 2: Add Server-Side Rendering

**Purpose**: Eliminate content flash by pre-populating puzzle via SSR (FR-011)

### Add Loader Function

- [x] T005 Add loader import types (LoaderFunctionArgs, json) from @remix-run/node in app/routes/cryptogram.tsx
- [x] T006 Add loader function to read puzzle from URL and decode with try-catch in app/routes/cryptogram.tsx
- [x] T007 Import useLoaderData from @remix-run/react in app/routes/cryptogram.tsx
- [x] T008 Initialize puzzleText state from useLoaderData instead of empty string in app/routes/cryptogram.tsx
- [x] T009 Remove the useEffect that reads from URL on mount in app/routes/cryptogram.tsx (no longer needed - SSR handles it)

### Inline Encoding in Client-Side URL Updates

- [x] T010 Update the URL write useEffect to inline encodeURIComponent (no utility call) in app/routes/cryptogram.tsx
- [x] T011 Verify error handling for empty puzzle (navigate to /cryptogram without params) in app/routes/cryptogram.tsx

---

## Phase 3: Update Tests

**Purpose**: Verify SSR works and no content flash occurs

- [x] T012 Add test comment documenting SSR behavior in cypress/e2e/cryptogram.cy.ts
- [x] T013 Verify existing "load puzzle from URL" test validates SSR (puzzle should be in initial page load, not flash)
- [x] T014 Run npm run test:e2e:run to verify all URL persistence tests still pass

---

## Phase 4: Quality & Validation

**Purpose**: Ensure code quality and verify improvements

- [x] T015 Run npm run lint and fix any issues
- [x] T016 Run npm run typecheck and fix any type errors
- [x] T017 Run npm run format to format code
- [x] T018 Manual test: Load cryptogram URL in browser, verify no content flash (SSR working)
- [x] T019 Manual test: Verify all 3 user stories still work (share, reload, live updates)

---

## Implementation Notes

**Refinements address:**

- ✅ Constitution Principle VIII compliance (remove utility abstraction)
- ✅ FR-011 compliance (SSR for PWA/mobile)
- ✅ Simpler codebase (net -115 LOC)
- ✅ Better UX (no content flash)

**What's NOT changing:**

- URL encoding approach (still uses encodeURIComponent/decodeURIComponent)
- Debounce strategy (still 300ms)
- Error handling approach (still silent fallback)
- All e2e tests (should continue passing)

**Before/After comparison:**

**Before (Current)**:

```typescript
// Separate utility file
import { encodePuzzleForUrl, decodePuzzleFromUrl } from "~/utils/url-encoding";

// Client-side only read
useEffect(() => {
  const puzzleParam = searchParams.get("puzzle");
  if (puzzleParam) {
    const decoded = decodePuzzleFromUrl(puzzleParam);
    setPuzzleText(decoded);
  }
}, [searchParams]);

// Client-side write
useEffect(() => {
  // ... debounce ...
  navigate(`?puzzle=${encodePuzzleForUrl(puzzleText)}`, { replace: true });
}, [puzzleText]);
```

**After (Refined)**:

```typescript
// No utility imports

// SSR read (loader)
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const puzzleParam = url.searchParams.get("puzzle");
  let initialPuzzle = "";
  if (puzzleParam) {
    try {
      initialPuzzle = decodeURIComponent(puzzleParam);
    } catch {
      initialPuzzle = "";
    }
  }
  return json({ initialPuzzle });
}

// Initialize from SSR
const { initialPuzzle } = useLoaderData<typeof loader>();
const [puzzleText, setPuzzleText] = useState(initialPuzzle);

// Client-side write (inline encoding)
useEffect(() => {
  // ... debounce ...
  navigate(`?puzzle=${encodeURIComponent(puzzleText)}`, { replace: true });
}, [puzzleText]);
```

---

## Total: 19 tasks (~1-2 hours)

**Phases:**

- Phase 1: Remove abstraction (4 tasks)
- Phase 2: Add SSR (7 tasks)
- Phase 3: Update tests (3 tasks)
- Phase 4: Quality gates (5 tasks)

**Execution Strategy**: Sequential is fine - this is refactoring work, not new feature development.

---

## Success Criteria

**Refinements are successful when:**

1. ✅ Utility files deleted (no app/utils/url-encoding.\*)
2. ✅ Loader function exists and working
3. ✅ No content flash on page load (SSR verified)
4. ✅ All e2e tests passing (28 tests)
5. ✅ All quality gates passing (lint, typecheck, format)
6. ✅ All 3 user stories still functional
7. ✅ Constitution Principle VIII compliant
