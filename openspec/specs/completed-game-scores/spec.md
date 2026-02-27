# Capability: Completed Game Scores

## Purpose

Provide a reusable score table component and an expandable scores view on the completed game page, allowing users to review the full turn-by-turn score breakdown after a game ends.

## Requirements

### Requirement: Reusable score table component

The system SHALL provide a reusable `ScoreTable` component that renders a columnar score breakdown for a list of players. Each player column SHALL display the player's name, their individual turn scores in order, and a bold total row separated by top and bottom borders. The leading player(s) SHALL be highlighted with a yellow background when their total exceeds zero. Empty turn slots SHALL be padded so all columns have equal height.

#### Scenario: Score table renders all players with scores

- **WHEN** the ScoreTable component is rendered with players who have scores
- **THEN** each player is shown in a column with their name, individual scores, and total
- **AND** the leading player's column has a yellow highlight

#### Scenario: Score table pads uneven turn counts

- **WHEN** players have different numbers of turns (e.g., Player A has 5 scores, Player B has 4)
- **THEN** the player with fewer turns has blank padding rows so all columns are the same height

#### Scenario: Score table truncates long player names

- **WHEN** a player name is too long to fit the column width
- **THEN** the name is truncated with ellipsis
- **AND** the full name is available via the element's title attribute

### Requirement: Expandable scores section on completed game page

The completed game page SHALL include a toggle button that shows or hides the full score breakdown. The scores section SHALL default to collapsed (hidden). When expanded, the section SHALL display the reusable ScoreTable component with all players and their scores.

#### Scenario: Scores section is collapsed by default

- **WHEN** a user navigates to a completed game page
- **THEN** the score breakdown is not visible
- **AND** a toggle button is displayed to show the scores

#### Scenario: User expands the scores section

- **WHEN** the user taps the toggle button while scores are hidden
- **THEN** the ScoreTable component is revealed showing the full turn-by-turn breakdown
- **AND** the toggle button updates to indicate the section can be collapsed

#### Scenario: User collapses the scores section

- **WHEN** the user taps the toggle button while scores are visible
- **THEN** the ScoreTable component is hidden
- **AND** the toggle button returns to its initial state

#### Scenario: Toggle placement on the page

- **WHEN** the completed game page is rendered
- **THEN** the toggle button and expandable scores section appear between the standings summary and the action buttons (Re-open, Rematch, Delete)

### Requirement: Play page uses shared ScoreTable component

The play page SHALL use the same ScoreTable component to render its score breakdown, replacing the current inline implementation. The visual output SHALL remain identical to the existing behavior.

#### Scenario: Play page renders scores via ScoreTable

- **WHEN** a user is on the active play page
- **THEN** the score table is rendered using the shared ScoreTable component
- **AND** the display is visually identical to the current inline implementation
