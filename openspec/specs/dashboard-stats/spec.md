# Capability: Dashboard Stats

## Purpose

TBD

## Requirements

### Requirement: Most popular game types card

The games index page SHALL display a card titled "Most Popular Games" showing the top 3 game types ranked by number of games played. Each entry SHALL display the game type name and the count of games. Only non-deleted games with an assigned game type SHALL be counted. Results SHALL be ordered by count descending.

#### Scenario: Top 3 game types displayed

- **WHEN** the user navigates to the games index page and has games with assigned game types
- **THEN** a card displays up to 3 game types ranked by game count, each showing the type name and count

#### Scenario: Fewer than 3 game types exist

- **WHEN** the user has games with only 1 or 2 distinct game types
- **THEN** the card displays only the available game types with their counts

#### Scenario: No games have game types

- **WHEN** the user has no games with assigned game types
- **THEN** the card displays a message indicating no game types have been used yet

#### Scenario: Deleted games excluded

- **WHEN** a game has been soft-deleted (deletedAt is set)
- **THEN** that game SHALL NOT be counted toward any game type's total

### Requirement: Most active players card

The games index page SHALL display a card titled "Most Active Players" showing the top 3 players ranked by number of games played. Each entry SHALL display the player name and the count of games. Only non-deleted games SHALL be counted. Results SHALL be ordered by count descending.

#### Scenario: Top 3 players displayed

- **WHEN** the user navigates to the games index page and has players who have played games
- **THEN** a card displays up to 3 players ranked by game count, each showing the player name and count

#### Scenario: Fewer than 3 players exist

- **WHEN** the user has only 1 or 2 players who have played games
- **THEN** the card displays only the available players with their counts

#### Scenario: No players have played games

- **WHEN** the user has no players who have played any games
- **THEN** the card displays a message indicating no games have been played yet

#### Scenario: Deleted games excluded from player counts

- **WHEN** a game has been soft-deleted
- **THEN** that game SHALL NOT be counted toward any player's game total
