# Feature Specification: Cryptogram Solution Aid

**Feature Branch**: `001-cryptogram-aid`
**Created**: 2026-01-06
**Status**: Draft
**Input**: User description: "I would like a cryptogram solution aid, this is intended to replace a pen and paper solution and method of solving the puzzle. It is not intended as a way to solve it for me"

## Clarifications

### Session 2026-01-06

- Q: How should users interact with the interface to create letter mappings? → A: Mapping table/grid - Separate control panel showing all 26 letters with input fields
- Q: Should the system support saving and loading puzzles across sessions? → A: No - Remove saved puzzles feature (User Story 3)
- Q: What should happen when a user maps multiple cipher letters to the same plain letter? → A: Allow with warning and highlight conflicts visually
- Q: Where should frequency counts be displayed and should hints be always visible? → A: Toggle/modal view - Hidden by default to preserve puzzle challenge. When user requests hints, show frequency counts for each cipher letter, frequency analysis, and suggest common letters that haven't been mapped yet
- Q: How should uppercase and lowercase letters be handled? → A: Case-insensitive mappings with display preservation - One mapping applies to both cases, but preserve original case formatting in the displayed text

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Manual Cryptogram Solving (Priority: P1)

A user receives a cryptogram puzzle and wants to solve it manually using systematic letter substitution tracking, just as they would with pen and paper, but with the convenience of digital editing and automatic text updates.

**Why this priority**: This is the core functionality - providing a digital workspace that mirrors the traditional pen-and-paper solving method while adding convenience through instant updates and easy corrections.

**Independent Test**: Can be fully tested by entering a cryptogram, making letter mappings, seeing the puzzle update in real-time, and correcting mistakes. Delivers a complete solving experience.

**Acceptance Scenarios**:

1. **Given** an empty cryptogram workspace, **When** I enter a cryptogram puzzle text, **Then** the encrypted text is displayed with each letter clearly visible and a mapping control panel shows all 26 letters with empty input fields
2. **Given** a displayed cryptogram with the mapping control panel, **When** I enter a plain letter in the input field for a cipher letter (e.g., enter "E" for cipher letter "Q"), **Then** all instances of that cipher letter are replaced with my chosen plain letter throughout the puzzle
3. **Given** existing letter mappings in the control panel, **When** I change a mapping (e.g., change "Q" from "E" to "A" in the control panel), **Then** all instances update immediately to reflect the new mapping
4. **Given** a letter mapping in the control panel, **When** I clear or remove it, **Then** the cipher letters revert to their original encrypted form in the puzzle text
5. **Given** a partially solved puzzle, **When** I review my work, **Then** I can see all my current mappings in the control panel and clearly distinguish between solved letters and unsolved cipher letters in the puzzle text

---

### User Story 2 - Inline Mapping Input (Priority: P2)

A user wants to enter letter mappings directly above the encrypted letters while solving the puzzle, mimicking the traditional pen-and-paper method where solvers write decrypted letters above cipher text. The alphabetical mapping grid should also be more compact to reduce screen space.

**Why this priority**: This provides a more intuitive solving experience that closely mirrors the traditional pen-and-paper approach while maintaining the convenience of the alphabetical reference grid for quick lookups.

**Independent Test**: Can be tested independently by entering a cryptogram and verifying that input boxes appear above each unique cipher letter in the puzzle, mappings can be entered in either location (inline or grid), both stay synchronized, and the grid takes up less vertical space.

**Acceptance Scenarios**:

1. **Given** a cryptogram is displayed, **When** I view the puzzle, **Then** each unique cipher letter has a small input box positioned directly above it where I can enter the plain letter mapping
2. **Given** inline input boxes above cipher letters, **When** I type a plain letter in an inline box (e.g., "E" above cipher letter "Q"), **Then** all instances of "Q" throughout the puzzle update to "E" and the mapping grid also updates to show "E" for "Q"
3. **Given** an existing mapping, **When** I change the mapping in either the inline box or the grid, **Then** both locations stay synchronized and all puzzle instances update immediately
4. **Given** both inline inputs and the mapping grid visible, **When** I compare the screen space used, **Then** the mapping grid occupies less vertical space than before while remaining fully functional
5. **Given** a cryptogram with many different cipher letters, **When** I scroll through the puzzle, **Then** I can easily see and edit mappings for letters currently in view without scrolling to the grid

---

### Future Enhancement - Progressive Hint System (Priority: P3 - Deferred)

**Note**: The hint system (frequency analysis, letter suggestions) has been moved to a separate feature (002-cryptogram-hints) to maintain focus on core solving functionality. This allows independent development and testing of hints as a distinct value proposition.

---

### Edge Cases

- What happens when a user tries to map two different cipher letters to the same plain letter? (System displays a warning message but allows the mapping and visually highlights the conflicting entries in both the control panel and inline inputs)
- What happens when a user enters a cryptogram with numbers or special characters? (Should preserve them as-is since they're typically not encrypted, and no inline input box should appear above them)
- How does the system handle very long cryptograms (500+ characters)? (Should remain performant and usable with inline inputs)
- What happens if a user tries to map a cipher letter to itself? (Should allow it but may show a hint that this is unusual)
- What happens when the same cipher letter appears multiple times in the puzzle? (Only one inline input box should appear above the first occurrence of each unique letter, and all instances update when that input changes)
- How should inline inputs behave on mobile devices with touch keyboards? (Should support touch input with appropriate keyboard and input sizing)

## Requirements _(mandatory)_

### Functional Requirements

#### Core Solving (User Story 1)

- **FR-001**: System MUST allow users to input or paste cryptogram puzzle text
- **FR-002**: System MUST display the cryptogram text with cipher letters clearly visible
- **FR-003**: System MUST provide a mapping table/grid control panel displaying all 26 letters (A-Z) with input fields where users can enter the corresponding plain letter for each cipher letter
- **FR-004**: System MUST instantly update all occurrences of a cipher letter in the puzzle text when a mapping is entered in the control panel
- **FR-005**: System MUST allow users to modify or remove existing letter mappings
- **FR-006**: System MUST visually distinguish between mapped (solved) letters and unmapped cipher letters
- **FR-007**: System MUST preserve spaces, punctuation, and numbers from the original cryptogram without modification
- **FR-008**: System MUST treat letter mappings as case-insensitive (one mapping for both 'A' and 'a'), while preserving the original case formatting of letters in the displayed cryptogram text
- **FR-009**: System MUST display a warning message when a user attempts to map multiple cipher letters to the same plain letter, while still allowing the mapping to proceed, and MUST visually highlight the conflicting mappings in the control panel
- **FR-010**: System MUST allow users to clear all mappings and start fresh with the same cryptogram

#### Inline Mapping Input (User Story 2)

- **FR-011**: System MUST display a small input box above each unique cipher letter in the puzzle text where users can directly enter the plain letter mapping
- **FR-012**: System MUST synchronize mappings bidirectionally - changes made in inline input boxes MUST update the mapping grid, and changes made in the mapping grid MUST update inline input boxes
- **FR-013**: System MUST update all instances of a cipher letter throughout the puzzle when a mapping is entered in either the inline input or the mapping grid
- **FR-014**: System MUST make the mapping grid more compact, occupying less vertical screen space while maintaining full functionality and readability
- **FR-015**: System MUST ensure inline input boxes are clearly associated with their corresponding cipher letters through visual positioning and styling
- **FR-016**: System MUST prevent automatic solving - all letter mappings must be user-initiated, regardless of input method (inline or grid)

### Key Entities

- **Cryptogram**: The encrypted puzzle text containing cipher letters to be decoded
- **Letter Mapping**: A single association between a cipher letter and a plain letter (e.g., Q → E)
- **Inline Input**: An input box positioned directly above a cipher letter in the puzzle text for direct mapping entry
- **Mapping Grid**: The alphabetical reference grid (A-Z) showing all possible letter mappings in a compact layout

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can enter a cryptogram and begin solving within 10 seconds
- **SC-002**: Letter mappings update across the entire puzzle instantly (under 100ms perceived response time) when entered in either inline inputs or the mapping grid
- **SC-003**: Users can complete a typical cryptogram (200-300 characters) without encountering usability issues or bugs
- **SC-004**: 90% of users successfully create and modify letter mappings on their first attempt without instructions, using either input method
- **SC-005**: System supports cryptograms up to 1000 characters without performance degradation, including inline input rendering
- **SC-006**: Users report that the digital tool is as intuitive or more intuitive than pen-and-paper solving (qualitative feedback)
- **SC-007**: The mapping grid occupies at least 30% less vertical screen space than the original implementation while maintaining full functionality

### Assumptions

- Users are familiar with how cryptogram puzzles work and understand basic solving techniques
- Cryptograms will use standard English alphabet letters (A-Z)
- Most cryptograms will be between 100-500 characters in length
- Users want to solve puzzles themselves and do not want automatic solving features
- The tool is for entertainment/puzzle-solving purposes, not cryptographic security analysis
- Users will solve one puzzle at a time in a single session without needing to persist progress across sessions
