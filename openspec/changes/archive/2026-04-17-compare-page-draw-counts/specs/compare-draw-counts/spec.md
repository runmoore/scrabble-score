## ADDED Requirements

### Requirement: Display draw counts in All-Time Record card

The "All-Time Record" card SHALL display a "Draws" column as the third column, after both player win columns. The draw count SHALL always be visible, including when the count is zero. The draw count SHALL use a neutral visual style distinct from the player-colored win counts.

A draw is defined as a game where both players have equal total scores.

#### Scenario: All-Time Record with draws

- **WHEN** two players have played 6 games with 2 wins for player 1, 3 wins for player 2, and 1 draw
- **THEN** the All-Time Record card SHALL display "2 - 3" for player wins and "1" in the Draws column

#### Scenario: All-Time Record with no draws

- **WHEN** two players have played 5 games with no draws
- **THEN** the All-Time Record card SHALL display "0" in the Draws column

### Requirement: Display draw counts in Last 5 Games card

The "Last 5 Games" card SHALL display a "Draws" column as the third column, after both player win columns, following the same layout and style as the All-Time Record card. The draw count SHALL always be visible, including when the count is zero.

#### Scenario: Last 5 Games with a draw

- **WHEN** the last 5 games include 2 wins for player 1, 2 wins for player 2, and 1 draw
- **THEN** the Last 5 Games card SHALL display "2 - 2" for player wins and "1" in the Draws column

#### Scenario: Last 5 Games with no draws

- **WHEN** the last 5 games include no draws
- **THEN** the Last 5 Games card SHALL display "0" in the Draws column

### Requirement: Loader returns draw counts

The compare page loader SHALL return `draws` and `drawsLastFive` counts alongside the existing `won` and `wonLastFive` fields. A game counts as a draw when both players have equal total scores.

#### Scenario: Loader counts draws correctly

- **WHEN** the loader processes games between two players where some games have equal scores
- **THEN** the response SHALL include accurate `draws` and `drawsLastFive` counts
