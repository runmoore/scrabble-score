## ADDED Requirements

### Requirement: In-progress game cards

The games index page SHALL display each in-progress game as an individual card. Each card SHALL show the player names, the game type (if assigned), the time since the game started (e.g., "2 days ago"), and each player's current total score. Each card SHALL link to the active play screen for the next player's turn. Cards SHALL use the accent style with a left blue border consistent with the compare page matchup cards.

#### Scenario: In-progress game card displays full game info

- **WHEN** the user navigates to the games index page and there are in-progress games
- **THEN** each in-progress game is rendered as a separate card
- **AND** each card shows all player names, game type name (if present), relative time since creation, and each player's current total score

#### Scenario: In-progress game card links to play screen

- **WHEN** the user taps an in-progress game card
- **THEN** the user is navigated to the active play screen for the next player to play

#### Scenario: In-progress game without game type

- **WHEN** an in-progress game has no assigned game type
- **THEN** the card omits the game type and displays only the time ago and player information

#### Scenario: No in-progress games

- **WHEN** the user has no in-progress games
- **THEN** no in-progress game cards are shown
- **AND** the summary cards (completed count, last completed) are still displayed

### Requirement: Completed games count card

The games index page SHALL display a card showing the total number of completed games for the user.

#### Scenario: Completed games count displays correctly

- **WHEN** the user navigates to the games index page and has completed games
- **THEN** a card displays the total count of completed games

#### Scenario: No completed games

- **WHEN** the user has no completed games
- **THEN** the completed games count card shows a count of zero

### Requirement: Last completed game card

The games index page SHALL display a card showing the most recently completed game. The card SHALL include the game type (if assigned), the game date, and the shared Leaderboard component showing the final standings (place, player name, total score).

#### Scenario: Last completed game card shows leaderboard

- **WHEN** the user navigates to the games index page and has at least one completed game
- **THEN** a card displays the most recently completed game with its game type, date, and the Leaderboard component showing final player standings sorted by score

#### Scenario: No completed games exist

- **WHEN** the user has no completed games
- **THEN** the last completed game card is not displayed

### Requirement: Dashboard grid layout

The games index page SHALL use a responsive card grid layout consistent with the compare page. Cards SHALL display in a single column on mobile, two columns on tablet, and three columns on desktop.

#### Scenario: Mobile layout

- **WHEN** the page is viewed on a mobile-width viewport
- **THEN** all cards stack in a single column

#### Scenario: Desktop layout

- **WHEN** the page is viewed on a desktop-width viewport
- **THEN** cards are arranged in up to three columns

### Requirement: New Game button

The games index page SHALL retain a prominent "New Game" button for creating new games.

#### Scenario: New Game button is accessible

- **WHEN** the user views the games index page
- **THEN** a "New Game" button is displayed that navigates to the new game creation page
