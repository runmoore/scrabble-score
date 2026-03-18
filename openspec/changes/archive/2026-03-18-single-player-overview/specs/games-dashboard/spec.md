## MODIFIED Requirements

### Requirement: Most active players card

The games index page SHALL display a card titled "Most Active Players" showing the top 3 players ranked by number of games played. The card title SHALL be a link that navigates to `/games/players`. Each entry SHALL display the player name and the count of games. Only non-deleted games SHALL be counted. Results SHALL be ordered by count descending.

#### Scenario: Top 3 players displayed

- **WHEN** the user navigates to the games index page and has players who have played games
- **THEN** a card displays up to 3 players ranked by game count, each showing the player name and count

#### Scenario: Card title links to player list

- **WHEN** a user taps the "Most Active Players" card title on the dashboard
- **THEN** the app SHALL navigate to `/games/players`

#### Scenario: Fewer than 3 players exist

- **WHEN** the user has only 1 or 2 players who have played games
- **THEN** the card displays only the available players with their counts

#### Scenario: No players have played games

- **WHEN** the user has no players who have played any games
- **THEN** the card displays a message indicating no games have been played yet

#### Scenario: Deleted games excluded from player counts

- **WHEN** a game has been soft-deleted
- **THEN** that game SHALL NOT be counted toward any player's game total
