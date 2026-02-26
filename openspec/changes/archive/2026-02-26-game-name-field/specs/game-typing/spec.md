## ADDED Requirements

### Requirement: Game type data model

The system SHALL store game types as reusable, user-owned entities with a unique ID and a name. Each game type SHALL belong to exactly one user. A game SHALL have an optional reference to one game type.

#### Scenario: Game type created

- **WHEN** a user creates a game type with name "Scrabble"
- **THEN** the system stores a GameType record with the name "Scrabble" linked to that user

#### Scenario: Game created with game type

- **WHEN** a user creates a game and selects an existing game type
- **THEN** the game record SHALL reference the selected game type

#### Scenario: Game created without game type

- **WHEN** a user creates a game without selecting a game type
- **THEN** the game record SHALL have no game type reference (null)

### Requirement: Game type selection on new game page

The system SHALL display a game type selection section on the new game page (`/games/new`) above the player selection section. The section SHALL list all game types owned by the current user as radio button options, plus a "N/A" option selected by default. Only one game type MAY be selected per game.

#### Scenario: User has existing game types

- **WHEN** a user with game types "Scrabble", "Sushi Go" visits the new game page
- **THEN** the system displays radio buttons for "N/A", "Scrabble", and "Sushi Go"
- **AND** "N/A" is selected by default

#### Scenario: User has no game types

- **WHEN** a user with no game types visits the new game page
- **THEN** the system displays only the "add new game type" form with no radio buttons

#### Scenario: User selects a game type and starts a game

- **WHEN** a user selects "Scrabble" as game type, selects 2+ players, and clicks "Start new Game"
- **THEN** the created game SHALL be linked to the "Scrabble" game type

#### Scenario: User starts a game with no game type

- **WHEN** a user leaves "N/A" selected, selects 2+ players, and clicks "Start new Game"
- **THEN** the created game SHALL have no game type

### Requirement: Inline game type creation

The system SHALL provide an inline form on the new game page to create a new game type, following the same pattern as the "add new player" form. The form SHALL have a text input and an "Add new game type" button. After creation, the new type SHALL appear in the selection list.

#### Scenario: User adds a new game type

- **WHEN** a user types "Molkky" into the game type input and clicks "Add new game type"
- **THEN** the system creates a GameType "Molkky" for the user
- **AND** the new game page reloads with "Molkky" appearing in the radio button list

#### Scenario: User submits empty game type name

- **WHEN** a user clicks "Add new game type" with an empty input
- **THEN** the system SHALL display a validation error and NOT create a game type

### Requirement: Game type display in games list

The system SHALL display the game type in the games list (`/games`). When a game has a game type, it SHALL be displayed as "{emoji} {GameType} - {Date}". When a game has no game type, the existing date-only format SHALL be used.

#### Scenario: Game with type in list

- **WHEN** a user views the games list containing a completed Scrabble game from 24th Feb 2026
- **THEN** the list item displays "🏆 Scrabble - 24th Feb 2026"

#### Scenario: Game without type in list

- **WHEN** a user views the games list containing a game with no game type
- **THEN** the list item displays the existing format with emoji and date only

### Requirement: Game type display on play screen

The system SHALL display the game type on the active play screen (`/games/$gameId.play.$playerId`). When a game has a game type, the type name SHALL be visible as a label/header on the page.

#### Scenario: Playing a game with type

- **WHEN** a user is on the play screen of a game with type "Sushi Go"
- **THEN** the page displays "Sushi Go" as a visible label

#### Scenario: Playing a game without type

- **WHEN** a user is on the play screen of a game with no game type
- **THEN** no game type label is displayed

### Requirement: Game type display on game summary

The system SHALL display the game type on the completed game summary page (`/games/$gameId`). When a game has a game type, the type name SHALL be visible as a label/header on the page.

#### Scenario: Viewing summary of game with type

- **WHEN** a user views the summary of a completed game with type "Molkky"
- **THEN** the page displays "Molkky" as a visible label

#### Scenario: Viewing summary of game without type

- **WHEN** a user views the summary of a completed game with no game type
- **THEN** no game type label is displayed
