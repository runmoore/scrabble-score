# player-detail Specification

## Purpose

Individual player detail page showing career stats (games played, win rate, average score, highest score), game type pill toggle filtering, and full game history with links to completed game summaries and in-progress play screens.

## Requirements

### Requirement: Player detail page route

The app SHALL render a player detail page at `/games/players/$playerId` showing the player's name as the page header.

#### Scenario: Accessing player detail

- **WHEN** a logged-in user navigates to `/games/players/${playerId}` for a player they own
- **THEN** the page SHALL display the player's name as the header with career stats, game type filters, and game history

#### Scenario: Player not found or wrong user

- **WHEN** a user navigates to a player detail page for a non-existent player or a player belonging to another user
- **THEN** the app SHALL return a 404 response

### Requirement: Game type pill toggle filtering

The player detail page SHALL provide game type pill toggles that filter all stats and history via a `?type=` search parameter. Toggles SHALL be derived from all games the player has participated in (including in-progress).

#### Scenario: Filtering by game type

- **WHEN** a user taps a game type pill
- **THEN** all stats and game history SHALL be filtered to show only games of that type
- **AND** the URL SHALL update with `?type=${gameTypeId}`

#### Scenario: Deselecting a game type filter

- **WHEN** a user taps the currently selected game type pill
- **THEN** the filter SHALL be removed, showing stats for all game types
- **AND** the `?type=` search parameter SHALL be removed from the URL

### Requirement: Career stats from completed games

The stats section SHALL display games played, win rate, average score, and highest score computed from completed games only.

#### Scenario: Stats when "All" game types selected

- **WHEN** no game type filter is active
- **THEN** games played SHALL show the total completed game count
- **AND** win rate SHALL show overall win percentage
- **AND** average score SHALL display per-game-type breakdowns (one line per type)
- **AND** highest score SHALL display per-game-type breakdowns with links to the game

#### Scenario: Stats when a specific game type is selected

- **WHEN** a game type filter is active
- **THEN** all stats SHALL show single values for the selected game type only

#### Scenario: No completed games

- **WHEN** a player has zero completed games
- **THEN** the stats section SHALL display "No completed games yet"

### Requirement: Win rate calculation

Win rate SHALL be calculated as wins divided by completed games. A "win" requires the player to have `place === 1` AND be the only player with `place === 1` (ties do not count as wins).

#### Scenario: Win with clear first place

- **WHEN** a player finishes in first place with no ties
- **THEN** it SHALL count as a win in the win rate calculation

#### Scenario: Tied first place

- **WHEN** a player ties for first place with another player
- **THEN** it SHALL NOT count as a win in the win rate calculation

### Requirement: Games without a game type in stats

Games with no assigned game type SHALL be included in overall stats when "All" is selected but SHALL be skipped in per-game-type breakdowns.

#### Scenario: Untyped games in overall stats

- **WHEN** "All" game types is selected and the player has games without a game type
- **THEN** those games SHALL be included in games played, win rate, and overall counts
- **AND** those games SHALL NOT appear in per-game-type average score or highest score breakdowns

### Requirement: Stats card grid layout

The player detail stats cards display in a responsive grid: 2 columns on mobile and tablet, 3 columns on desktop.

#### Scenario: Viewing player stats on mobile

- **WHEN** the viewport is below the `md` breakpoint (< 768px)
- **THEN** the stats cards grid displays in 2 columns

#### Scenario: Viewing player stats on tablet

- **WHEN** the viewport is at or above the `md` breakpoint (≥ 768px) and below `lg` (< 1024px)
- **THEN** the stats cards grid displays in 2 columns

#### Scenario: Viewing player stats on desktop

- **WHEN** the viewport is at or above the `lg` breakpoint (≥ 1024px)
- **THEN** the stats cards grid displays in 3 columns

### Requirement: Game history list

The game history section SHALL show all games (completed and in-progress), newest first, in a scrollable list. Completed game rows SHALL link to `/games/${game.id}`. In-progress game rows SHALL link to the play screen at `/games/${game.id}/play/${nextPlayerId}`.

#### Scenario: Game history display

- **WHEN** the player detail page loads with game history
- **THEN** each row SHALL show date, game type, player's score, and placement (e.g. "1st of 3")
- **AND** rows SHALL be ordered newest first
- **AND** each completed game row SHALL link to `/games/${game.id}`

#### Scenario: In-progress game in history

- **WHEN** an in-progress game appears in the history
- **THEN** it SHALL display an "In Progress" badge instead of placement
- **AND** it SHALL link to `/games/${game.id}/play/${nextPlayerId}` where nextPlayerId is the next player to play

#### Scenario: Filtered game history

- **WHEN** a game type filter is active
- **THEN** the history list SHALL show only games of the selected type
