## ADDED Requirements

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

## MODIFIED Requirements

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
