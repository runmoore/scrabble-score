## MODIFIED Requirements

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

#### Scenario: Submitting a duplicate player name

- **WHEN** the user submits the add-player form with a name that matches an existing player name (case-insensitive)
- **THEN** the form SHALL remain visible
- **AND** a red error message "player name already exists" SHALL be displayed below the input

#### Scenario: Submitting a duplicate game type name

- **WHEN** the user submits the add-game-type form with a name that matches an existing game type name (case-insensitive)
- **THEN** the form SHALL remain visible
- **AND** a red error message "game type name already exists" SHALL be displayed below the input

#### Scenario: Submitting a duplicate name with different casing

- **WHEN** the user submits a name that differs from an existing name only in letter casing (e.g., "alice" when "Alice" exists)
- **THEN** the system SHALL treat it as a duplicate and display the duplicate name error

#### Scenario: Successful submission after error

- **WHEN** the user corrects an invalid name and resubmits
- **THEN** the form SHALL close and the new item SHALL appear as a pill
