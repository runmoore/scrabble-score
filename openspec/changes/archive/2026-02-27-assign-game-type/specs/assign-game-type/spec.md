## ADDED Requirements

### Requirement: Set game type on existing typeless game

The system SHALL allow a user to assign a game type to an existing game that currently has no game type (`gameTypeId` is null). Once a game type is set, it SHALL NOT be changeable or removable through this feature. Games that already have a game type SHALL NOT display the assignment UI.

#### Scenario: User assigns game type from game summary page

- **WHEN** a user views the summary of a game with no game type and selects "Scrabble" from the game type list
- **THEN** the game record SHALL be updated to reference the "Scrabble" game type
- **AND** the page SHALL reload showing the game type name as a heading

#### Scenario: User assigns game type from play screen

- **WHEN** a user is on the play screen of a game with no game type and selects "Sushi Go" from the game type list
- **THEN** the game record SHALL be updated to reference the "Sushi Go" game type
- **AND** the page SHALL reload showing the game type name as a heading

#### Scenario: Game already has a game type

- **WHEN** a user views the summary or play screen of a game that already has a game type
- **THEN** the game type name SHALL be displayed as a read-only heading
- **AND** no assignment UI SHALL be shown

### Requirement: Game type assignment UI

The system SHALL display a game type assignment section on both the game summary page and the play screen when the game has no game type and the user has at least one existing game type. The section SHALL show the label "Set game type:" followed by a button for each of the user's game types, all on a single line. The system SHALL NOT provide inline creation of new game types on these pages — new game types are created on the new game page only.

#### Scenario: User has existing game types and views typeless game

- **WHEN** a user with game types "Scrabble" and "Sushi Go" views a game with no game type
- **THEN** the system SHALL display "Set game type:" followed by buttons for "Scrabble" and "Sushi Go" on the same line

#### Scenario: User has no game types and views typeless game

- **WHEN** a user with no game types views a game with no game type
- **THEN** no assignment UI SHALL be displayed

### Requirement: Server function to set game type

The system SHALL provide a server function `setGameType` that updates an existing game's game type reference. The function SHALL only update games that belong to the requesting user and currently have no game type.

#### Scenario: Setting game type on a typeless game

- **WHEN** `setGameType` is called with a valid game ID, user ID, and game type ID
- **AND** the game belongs to the user and has no current game type
- **THEN** the game record SHALL be updated with the provided game type ID

#### Scenario: Attempting to set game type on a game that already has one

- **WHEN** `setGameType` is called on a game that already has a game type
- **THEN** the operation SHALL NOT modify the game
