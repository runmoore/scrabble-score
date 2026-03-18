## MODIFIED Requirements

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
