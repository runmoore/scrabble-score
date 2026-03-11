# New Game UI

## Purpose

Specifies the user interface requirements for the "New Game" page, including game type selection, player selection, collapsible add forms, and form submission behavior.

## Requirements

### Requirement: Game type pill selector

The game type section SHALL always be visible on the new game page. Game types SHALL be rendered as pill-shaped toggle buttons using visually-hidden radio inputs with styled labels. Only one game type MAY be selected at a time. An "N/A" option SHALL be selected by default.

#### Scenario: No game types exist

- **WHEN** the user has no game types created
- **THEN** the game type section SHALL still be displayed with only the "+ Add game type" trigger visible

#### Scenario: Selecting a game type

- **WHEN** the user taps a game type pill
- **THEN** that pill SHALL display a solid `blue-primary` background with white text
- **AND** the previously selected pill SHALL revert to the unselected style (`gray-100` / `dark:gray-700`)

#### Scenario: Default selection

- **WHEN** the new game page loads with existing game types
- **THEN** the "N/A" pill SHALL be selected by default

### Requirement: Player pill selector

Players SHALL be rendered as pill-shaped toggle buttons using visually-hidden checkbox inputs with styled labels. Multiple players MAY be selected simultaneously. Selection state SHALL be indicated by color change only (no checkmark icon).

#### Scenario: Selecting players

- **WHEN** the user taps an unselected player pill
- **THEN** the pill SHALL display a solid `purple-primary` background with white text

#### Scenario: Deselecting a player

- **WHEN** the user taps a selected player pill
- **THEN** the pill SHALL revert to the unselected style (`gray-100` / `dark:gray-700`)

#### Scenario: No players exist

- **WHEN** the user has no players created
- **THEN** the player section SHALL display only the "+ Add player" trigger

### Requirement: Pill touch targets

All pill toggles SHALL have a minimum touch target size suitable for mobile use. Pills SHALL be rendered in a wrapping horizontal flow layout.

#### Scenario: Mobile touch target sizing

- **WHEN** the page is rendered on a mobile device
- **THEN** each pill SHALL have sufficient padding to meet a minimum 44px touch target height

### Requirement: Section layout with Card grouping

The new game page SHALL organize its content into visually distinct sections using the existing Card component. Sections SHALL include: game type selection, player selection.

The page container SHALL use `max-w-lg` on mobile viewports and `max-w-4xl` at the `lg:` breakpoint and above.

At the `lg:` breakpoint and above, the Game Type and Players Card sections SHALL be displayed side-by-side in a two-column grid layout with equal-width columns. Below the `lg:` breakpoint, the cards SHALL remain stacked vertically (single column).

The Start Game button SHALL be positioned below both Card sections, spanning the full width of the container at all breakpoints.

#### Scenario: Visual grouping

- **WHEN** the new game page is rendered
- **THEN** the game type selection and player selection SHALL each be contained within a Card component with a section heading

#### Scenario: Desktop two-column layout

- **WHEN** the viewport width is at or above the `lg:` breakpoint (1024px)
- **THEN** the Game Type card and Players card SHALL be displayed side-by-side in a two-column grid
- **AND** each card SHALL occupy equal width
- **AND** the page container SHALL use `max-w-4xl`

#### Scenario: Mobile single-column layout

- **WHEN** the viewport width is below the `lg:` breakpoint
- **THEN** the Game Type card and Players card SHALL be stacked vertically
- **AND** the page container SHALL use `max-w-lg`

#### Scenario: Start Game button positioning

- **WHEN** the new game page is rendered at any viewport width
- **THEN** the Start Game button SHALL appear below both Card sections
- **AND** the button SHALL span the full width of the container

#### Scenario: Cards with unequal content height on desktop

- **WHEN** one Card section has more content than the other (e.g., many players vs few game types)
- **THEN** each card SHALL size to its own content height (not stretch to match the taller card)

### Requirement: Collapsible add forms

The "add new player" and "add new game type" forms SHALL be collapsible, appearing inline within their respective sections. A text-button trigger (e.g., "+ Add player") SHALL reveal the input field. The form SHALL only collapse on successful submission — it SHALL remain open when the server returns a validation error.

#### Scenario: Revealing the add player form

- **WHEN** the user taps "+ Add player" within the player section
- **THEN** a text input and submit button SHALL appear inline below the player pills

#### Scenario: Revealing the add game type form

- **WHEN** the user taps "+ Add game type" within the game type section
- **THEN** a text input and submit button SHALL appear inline below the game type pills

#### Scenario: After adding a player successfully

- **WHEN** the user submits a valid new player name
- **THEN** the new player SHALL appear as an unselected pill in the player section
- **AND** the add form SHALL collapse

#### Scenario: After adding a game type successfully

- **WHEN** the user submits a valid new game type name
- **THEN** the new game type SHALL appear as an unselected pill in the game type section
- **AND** the add form SHALL collapse

#### Scenario: Form stays open on validation error

- **WHEN** the user submits an invalid name (empty or whitespace-only)
- **THEN** the add form SHALL remain open with the error message visible
- **AND** the user SHALL be able to correct the input and resubmit

### Requirement: Inline form error display

Both the add-player and add-game-type inline forms SHALL display validation errors returned from the server. Errors SHALL be rendered as red text (`text-red-500 dark:text-red-400`) below the input row. Each form SHALL read errors from its own fetcher data, not from the page-level action data.

#### Scenario: Submitting an empty player name

- **WHEN** the user submits the add-player form with an empty name
- **THEN** the form SHALL remain visible
- **AND** a red error message SHALL be displayed below the input

#### Scenario: Submitting an empty game type name

- **WHEN** the user submits the add-game-type form with an empty name
- **THEN** the form SHALL remain visible
- **AND** a red error message SHALL be displayed below the input

#### Scenario: Submitting a whitespace-only name

- **WHEN** the user submits either inline form with a name containing only whitespace characters
- **THEN** the system SHALL treat it as an empty name and display the same error

#### Scenario: Successful submission after error

- **WHEN** the user corrects an invalid name and resubmits
- **THEN** the form SHALL close and the new item SHALL appear as a pill

### Requirement: Whitespace trimming on name inputs

The server action SHALL trim leading and trailing whitespace from player names and game type names before validation and storage. This ensures names like `" Alice "` are stored as `"Alice"` and names like `" "` are rejected as empty.

#### Scenario: Leading and trailing whitespace trimmed

- **WHEN** a user submits a name with leading or trailing whitespace (e.g., `" Alice "`)
- **THEN** the stored name SHALL be `"Alice"` with whitespace removed

#### Scenario: Whitespace-only name rejected

- **WHEN** a user submits a name consisting entirely of whitespace characters
- **THEN** the server SHALL return an error identical to submitting an empty string

### Requirement: Start game button with player count

The "Start Game" button SHALL display the number of selected players when at least 2 are selected. The button SHALL be disabled with explanatory text when fewer than 2 players are selected.

#### Scenario: Fewer than 2 players selected

- **WHEN** the user has selected fewer than 2 players
- **THEN** the button SHALL display "Select at least 2 players" and be disabled

#### Scenario: 2 or more players selected

- **WHEN** the user has selected 2 or more players
- **THEN** the button SHALL display "Start Game (N players)" where N is the count, and be enabled with a `green-primary` background

### Requirement: Form submission compatibility

The redesigned page SHALL preserve the existing form submission behavior. All form data (selected players, game type) SHALL be submitted via standard Remix Form POST without requiring JavaScript.

#### Scenario: Form submission without JavaScript

- **WHEN** the user submits the form with JavaScript disabled
- **THEN** the selected player IDs and game type ID SHALL be included in the POST body via the hidden inputs

#### Scenario: Existing action handler compatibility

- **WHEN** the form is submitted
- **THEN** the server action SHALL receive the same `players[]` and `gameTypeId` form fields as the current implementation

### Requirement: Dark mode support

All new UI elements SHALL support dark mode via Tailwind `dark:` variants, consistent with the rest of the application.

#### Scenario: Dark mode pill rendering

- **WHEN** the user's system is set to dark mode
- **THEN** unselected pills SHALL use `dark:gray-700` background with light text
- **AND** selected pills SHALL use their respective primary color backgrounds with white text
- **AND** Card components and inputs SHALL use appropriate dark mode styles
