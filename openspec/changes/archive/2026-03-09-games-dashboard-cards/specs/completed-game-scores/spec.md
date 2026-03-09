## ADDED Requirements

### Requirement: Reusable Leaderboard component

The system SHALL provide a reusable `Leaderboard` component that displays player standings with ordinal place (1st, 2nd, etc.), player name, and total score in a three-column layout. The first-place player(s) SHALL be indicated with a trophy emoji. The component SHALL be usable on both the completed game summary page and the games dashboard.

#### Scenario: Leaderboard renders standings on game summary page

- **WHEN** the Leaderboard component is rendered on the completed game summary page
- **THEN** it displays the same place/name/score layout currently shown inline
- **AND** the visual output is identical to the existing behavior

#### Scenario: Leaderboard renders standings on games dashboard

- **WHEN** the Leaderboard component is rendered inside the last completed game card on the games dashboard
- **THEN** it displays player standings with ordinal place, name, and total score

#### Scenario: Multiple players share first place

- **WHEN** two or more players have the same top score
- **THEN** all tied players show the same ordinal place and trophy emoji

## MODIFIED Requirements

### Requirement: Expandable scores section on completed game page

The completed game page SHALL include a toggle button that shows or hides the full score breakdown. The scores section SHALL default to collapsed (hidden). When expanded, the section SHALL display the reusable ScoreTable component with all players and their scores. The standings display above the toggle SHALL use the shared Leaderboard component instead of inline markup.

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

#### Scenario: Standings use shared Leaderboard component

- **WHEN** the completed game page renders the player standings
- **THEN** the standings are rendered using the shared Leaderboard component
- **AND** the visual output is identical to the current inline implementation
