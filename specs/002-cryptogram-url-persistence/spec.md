# Feature Specification: Cryptogram URL Persistence

**Feature Branch**: `002-cryptogram-url-persistence`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "The cryptogram page needs to have better persistence, the user should reload the page and the content still exist. As a start something in the URL should identify the cryptogram encoded text. Do not worry about persisting progress of the solution, the goal is to make cryptograms shareable between friends and on page refreshes"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Share Cryptogram via URL (Priority: P1)

Users can share cryptogram puzzles with friends by copying and sending the URL. When friends click the link, they see the same cryptogram puzzle ready to solve.

**Why this priority**: This is the core value proposition - enabling shareability between users. Without this, the feature has no value. This is a complete, independently valuable slice of functionality.

**Independent Test**: Can be fully tested by entering a cryptogram, copying the URL, opening it in a new browser tab or sharing with another user, and verifying the same puzzle text appears.

**Acceptance Scenarios**:

1. **Given** a user has entered a cryptogram puzzle, **When** they view the URL in the address bar, **Then** the URL contains the encoded puzzle text
2. **Given** a user has a cryptogram URL with an encoded puzzle, **When** they share that URL with a friend, **Then** the friend can open the URL and see the same puzzle text
3. **Given** a user has entered a cryptogram puzzle, **When** they copy the URL and paste it into a new browser tab, **Then** the puzzle text loads automatically in the new tab

---

### User Story 2 - Reload Page Without Losing Puzzle (Priority: P2)

Users can refresh their browser or accidentally close the tab, and when they return to the cryptogram page via the URL, their puzzle text is preserved.

**Why this priority**: This enhances the user experience by providing resilience against accidental page reloads or browser crashes. It builds on P1's URL encoding mechanism but focuses on individual user continuity rather than sharing.

**Independent Test**: Can be tested by entering a puzzle, copying the URL, refreshing the page, and verifying the puzzle persists. Delivers value by preventing data loss for individual users.

**Acceptance Scenarios**:

1. **Given** a user has entered a cryptogram puzzle, **When** they refresh the page, **Then** the same puzzle text remains in the input area
2. **Given** a user has navigated to a cryptogram URL with an encoded puzzle, **When** they reload the page, **Then** the puzzle text persists without requiring re-entry
3. **Given** a user closes their browser and reopens the same cryptogram URL from their history, **When** the page loads, **Then** the puzzle text is restored

---

### User Story 3 - URL Updates as User Types (Priority: P3)

As users type or modify their cryptogram puzzle text, the URL automatically updates to reflect the current puzzle state, ensuring the URL always represents the latest version without requiring manual action.

**Why this priority**: This is a convenience enhancement that makes the sharing mechanism more seamless and reduces user friction. It's valuable but not essential for the core functionality - users could manually copy the URL after finishing their puzzle entry.

**Independent Test**: Can be tested by typing into the puzzle input and observing the URL change dynamically. Delivers incremental UX improvement for users who want to share mid-entry.

**Acceptance Scenarios**:

1. **Given** a user is typing in the puzzle input, **When** they pause typing for a moment, **Then** the URL updates to include the current puzzle text
2. **Given** a user has an existing puzzle and modifies it, **When** they make changes to the text, **Then** the URL reflects the updated puzzle text
3. **Given** a user clears the puzzle input, **When** the input becomes empty, **Then** the URL no longer contains puzzle encoding parameters

---

### Edge Cases

- What happens when the URL contains invalid or corrupted encoded puzzle data? (System should gracefully handle by showing empty puzzle input with no error message - silent fallback)
- What happens when the puzzle text is extremely long and exceeds URL length limits? (System should handle according to existing 1000 character limit validation)
- What happens when the URL contains special characters, emojis, or non-English text in the puzzle? (System must properly URL-encode and decode all valid Unicode characters)
- What happens when a user navigates to the cryptogram page without any URL parameters? (System should show empty puzzle input, ready for new entry)
- What happens when a user modifies the URL parameters manually to inject invalid data? (System should validate and sanitize, falling back to empty puzzle if invalid)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST encode the cryptogram puzzle text in the URL as a query parameter when puzzle text is present
- **FR-002**: System MUST decode the puzzle text from the URL query parameter when the page loads
- **FR-003**: System MUST preserve all characters in the puzzle text through URL encoding/decoding (letters, numbers, punctuation, spaces, line breaks)
- **FR-004**: System MUST update the browser's address bar URL when the puzzle text changes
- **FR-005**: System MUST handle empty or missing URL parameters by displaying an empty puzzle input
- **FR-006**: System MUST validate URL-encoded puzzle data and handle corrupted or invalid data gracefully with silent fallback (no error messages displayed to user)
- **FR-007**: System MUST respect the existing 1000 character limit for puzzle text in URL encoding
- **FR-008**: System MUST properly encode special characters (including Unicode) for URL compatibility
- **FR-009**: URLs MUST be copyable and shareable via standard browser mechanisms (copy/paste, share buttons)
- **FR-010**: System MUST NOT persist user's solution progress (mappings) in the URL - only the original puzzle text
- **FR-011**: System MUST use Server-Side Rendering (SSR) to pre-populate puzzle text from URL parameters, avoiding client-side content flash on page load

### Key Entities _(include if feature involves data)_

- **Cryptogram Puzzle**: The encrypted text that users enter, consisting of letters, numbers, punctuation, spaces, and line breaks (up to 1000 characters). This is the only data that needs URL persistence.
- **URL State**: The encoded representation of the puzzle text stored as URL query parameters, enabling shareability and page reload persistence.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can share cryptogram puzzles by copying the URL, and recipients can open the URL to see the exact same puzzle 100% of the time
- **SC-002**: Users who refresh the page with a cryptogram puzzle loaded see the same puzzle persist without data loss 100% of the time
- **SC-003**: The URL encoding mechanism supports all valid puzzle characters (letters, numbers, punctuation, Unicode) without corruption
- **SC-004**: Users can successfully share cryptograms with puzzles up to the 1000 character limit via URL
- **SC-005**: The puzzle loading experience from URL feels instantaneous to users (no perceptible delay on standard connections)
- **SC-006**: Invalid or corrupted URL data fails gracefully without breaking the page, showing empty puzzle with no error messages

## Clarifications

### Session 2026-01-07

- Q: What specific performance targets (in milliseconds) should define "instantaneous" and "no perceptible delay" for URL updates and page loading? → A: Keep as "instantaneous" without specific metrics
- Q: Should the system show an error message when invalid URL data is encountered? → A: No - silent fallback with no error messages, no new UI components like toasts or banners
- Q: Should the page use Server-Side Rendering (SSR) when a puzzle is in the URL to avoid content flash? → A: Yes - SSR with puzzle pre-populated, loader reads URL param, page renders with puzzle already in HTML (no flash)
- Q: Should URL encoding/decoding use separate utility functions or be inlined? → A: Inline - use `encodeURIComponent`/`decodeURIComponent` directly in component, no separate utility file. Trivial wrappers add unnecessary abstraction.

## Assumptions

- Users will primarily share cryptogram URLs via messaging apps, email, or social media where URLs are clickable
- The existing 1000 character puzzle limit provides sufficient constraint to avoid URL length issues across all major browsers (modern browsers support URLs up to 2048+ characters)
- Users do not expect their solution progress (letter mappings) to be saved - only the puzzle text itself needs persistence
- URL encoding using standard query parameters (e.g., `?puzzle=...`) is an acceptable implementation approach
- Users are familiar with URL sharing mechanisms (copy/paste, browser share buttons)
- The cryptogram feature is currently session-only with no database persistence, and this will remain true for this feature

## Dependencies

- Existing cryptogram page implementation in `app/routes/cryptogram.tsx`
- Remix's `useSearchParams` hook (already in use in current implementation)
- Browser's History API or Remix navigation for URL updates
- Standard JavaScript URL encoding/decoding functions (encodeURIComponent, decodeURIComponent)

## Out of Scope

- Persisting user's solution progress (letter mappings) in the URL or any storage mechanism
- Database or backend storage of cryptograms
- User authentication or account-based cryptogram saving
- Social sharing meta tags or Open Graph integration
- Custom short URLs or URL shortening service integration
- Cryptogram statistics, analytics, or usage tracking
- Version history or undo/redo functionality for puzzle edits
- Collaborative solving features (multiple users solving together)
