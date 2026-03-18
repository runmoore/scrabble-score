## ADDED Requirements

### Requirement: Player list page route

The app SHALL render a player list page at `/games/players` under the games layout, inheriting the sidebar navigation.

#### Scenario: Accessing the player list

- **WHEN** a logged-in user navigates to `/games/players`
- **THEN** the page SHALL display all players belonging to that user as tappable card components

### Requirement: Player card content and sorting

Each player card SHALL display the player's name and their completed games count. Cards SHALL be sorted by most completed games descending, with alphabetical name as tiebreaker.

#### Scenario: Player cards display and ordering

- **WHEN** the player list page loads with multiple players
- **THEN** each card SHALL show the player name and completed game count
- **AND** cards SHALL be ordered by completed game count descending
- **AND** players with equal game counts SHALL be ordered alphabetically by name

#### Scenario: Tapping a player card

- **WHEN** a user taps a player card
- **THEN** the app SHALL navigate to `/games/players/${player.id}`

### Requirement: Player list empty state

The player list page SHALL display an empty state when no players exist.

#### Scenario: No players

- **WHEN** the player list page loads and the user has no players
- **THEN** the page SHALL display "No players yet. Create a game to add players."

### Requirement: Players sidebar navigation

A "Players" NavLink SHALL be added to the `GamesMenu` sidebar component alongside the existing navigation links.

#### Scenario: Sidebar navigation

- **WHEN** a user views any page under the games layout
- **THEN** a "Players" link SHALL be visible in the sidebar navigation
- **AND** the link SHALL navigate to `/games/players`
