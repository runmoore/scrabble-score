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

#### Scenario: Visual grouping

- **WHEN** the new game page is rendered
- **THEN** the game type selection and player selection SHALL each be contained within a Card component with a section heading

### Requirement: Collapsible add forms

The "add new player" and "add new game type" forms SHALL be collapsible, appearing inline within their respective sections. A text-button trigger (e.g., "+ Add player") SHALL reveal the input field.

#### Scenario: Revealing the add player form

- **WHEN** the user taps "+ Add player" within the player section
- **THEN** a text input and submit button SHALL appear inline below the player pills

#### Scenario: Revealing the add game type form

- **WHEN** the user taps "+ Add game type" within the game type section
- **THEN** a text input and submit button SHALL appear inline below the game type pills

#### Scenario: After adding a player

- **WHEN** the user submits a new player name
- **THEN** the new player SHALL appear as an unselected pill in the player section

#### Scenario: After adding a game type

- **WHEN** the user submits a new game type name
- **THEN** the new game type SHALL appear as an unselected pill in the game type section

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
