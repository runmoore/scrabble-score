# Feature Specification: Cryptogram Mapping Table Visual Redesign

**Feature Branch**: `003-mapping-table-redesign`
**Created**: 2026-01-13
**Status**: Draft
**Input**: User description: "I want to make a small visual ammendment to the cryptogram page. This is a small feature, so limit your thinking and output to reflect this. You shouldn't over complicate the plan, or the task breakdown, it really is simple. I'd like to make a change to the letter mapping table that's the last component on the page. Currently the boxes and letters look very similar to the solution above it, which has boxes and letters, visually this is confusing to a user. Instead I'd like a more traditional table. The functionality must remain identical, this is purely a UI change. Make sure the UI is clean, distinct, and works across all screen sizes but primarily it works on mobile."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Visual Distinction (Priority: P1)

As a cryptogram solver, when I scroll down the page, I need to immediately distinguish between the puzzle solution area (where I enter guesses inline) and the reference mapping table (where I can view all letter mappings at a glance), so I don't confuse the two interactive areas.

**Why this priority**: This is the core issue - users are currently confused because both areas use similar box-based layouts. Solving this confusion is the entire purpose of this feature.

**Independent Test**: Can be fully tested by loading the cryptogram page on mobile and desktop, visually comparing the solution area with the mapping table, and confirming they look distinctly different.

**Acceptance Scenarios**:

1. **Given** I am viewing a cryptogram with inline mapping inputs above letters, **When** I scroll to the letter mapping section at the bottom, **Then** I immediately recognize it as a different component with traditional table styling
2. **Given** I am using the cryptogram page on a mobile device, **When** I view both the solution area and mapping table, **Then** both areas are visually distinct with different styling approaches (boxes vs table)
3. **Given** I am entering mappings in either location, **When** I look at the mapping table, **Then** it appears as a clean, traditional table with rows and columns

---

### Edge Cases

- What happens when the table is viewed on very small mobile screens (320px width)?
- How does the table layout adapt for medium screens (tablets) and large screens (desktop)?
- Does the table remain usable with touch targets on mobile devices?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The mapping table MUST maintain all existing functionality (26 letter inputs A-Z, conflict highlighting, clear all button, disabled states)
- **FR-002**: The mapping table MUST use a Flexbox layout with fixed-width cells (80px) and inverted color styling (light gray cells with white gaps acting as borders) to provide visual distinction from the inline inputs above
- **FR-003**: The mapping table MUST be visually distinct from the inline mapping inputs in the solution area above it
- **FR-004**: The mapping table MUST remain usable on mobile devices, tablets, and desktop screens with naturally responsive column count

### Key Entities _(include if feature involves data)_

- **MappingGrid Component**: The React component at the bottom of the cryptogram page that displays all 26 letter mappings (A-Z) with input fields and a clear button

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can visually distinguish the mapping table from the solution area when viewing the page
- **SC-002**: The redesigned table displays correctly across mobile, tablet, and desktop screen sizes
- **SC-003**: Users can successfully enter letter mappings, clear all mappings, and see conflict highlighting in the table format

## Clarifications

### Session 2026-01-13

- Q: For the "traditional table" styling, what visual treatment will provide the clearest distinction from the box-grid layout above? → A: Initially planned bordered with subtle row shading (zebra striping), but during implementation evolved to an inverted color approach with light gray cells and white gaps for better SSR compatibility and cleaner visual appearance

## Assumptions

- The current MappingGrid component in `app/routes/cryptogram.tsx` (lines 273-345) is the target for redesign
- "Traditional table" evolved during implementation to mean a structured grid with clear visual borders, achieved through Flexbox with inverted colors rather than HTML table elements
- The existing Tailwind CSS utility classes are sufficient for styling
- Mobile-first design means optimizing for touch interaction and narrow screens (iPhone as primary target)
- The inline mapping inputs above each letter in the solution area remain unchanged (those use small box inputs and are working as intended)
- SSR compatibility is essential (no JavaScript-based layout solutions)

## Testing & Verification Strategy

### Manual Verification (Primary)

- Chrome DevTools MCP server MUST be used for manual verification of visual changes
- Manual testing will validate the visual distinction, responsive behavior, and usability across screen sizes
- Visual regression should be verified by comparing before/after screenshots using Chrome DevTools

### E2E Test Changes (Minimal)

- E2E test changes MUST be kept to an absolute minimum
- Existing E2E tests should continue to pass with minimal or no modifications
- Only update test selectors if the DOM structure changes require it
- Do NOT add new E2E tests for visual changes - rely on manual verification instead

### Scope Emphasis

- This is a **simple visual change only** - no functional behavior changes
- Focus verification on visual appearance and styling differences
- Existing functionality (letter input, conflict detection, clear button) should work exactly as before without requiring new test coverage
