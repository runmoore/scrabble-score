## ADDED Requirements

### Requirement: Floating new game button on mobile

The games index page SHALL display a floating action button (FAB) for creating a new game that remains visible at all times on mobile viewports (below the `sm` breakpoint). The FAB SHALL be positioned fixed at the bottom-right of the viewport and SHALL navigate to the new game page when tapped.

#### Scenario: FAB visible without scrolling

- **WHEN** the user views the games index page on a mobile viewport
- **THEN** a "New Game" button SHALL be visible in the bottom-right corner of the screen without any scrolling

#### Scenario: FAB remains visible while scrolling

- **WHEN** the user scrolls through the dashboard cards on a mobile viewport
- **THEN** the "New Game" FAB SHALL remain fixed in position and visible at all times

#### Scenario: FAB navigates to new game page

- **WHEN** the user taps the floating "New Game" button
- **THEN** the app SHALL navigate to the new game creation page (`/games/new`)

### Requirement: Inline new game button on desktop

On viewports at or above the `sm` breakpoint, the games index page SHALL display the "New Game" button inline at the top of the dashboard content area, before the card grid.

#### Scenario: Inline button visible at top on desktop

- **WHEN** the user views the games index page on a desktop viewport (sm breakpoint or wider)
- **THEN** a "New Game" button SHALL appear inline above the dashboard cards
- **AND** no floating button SHALL be visible

#### Scenario: Inline button navigates to new game page

- **WHEN** the user clicks the inline "New Game" button on desktop
- **THEN** the app SHALL navigate to the new game creation page (`/games/new`)

### Requirement: FAB does not obscure dashboard content

The card grid on the games index page SHALL include sufficient bottom padding on mobile viewports so that the floating action button does not overlap or obscure the last card's content.

#### Scenario: Last card fully visible above FAB

- **WHEN** the user scrolls to the bottom of the games index page on a mobile viewport
- **THEN** the last dashboard card SHALL be fully visible without being obscured by the floating action button

### Requirement: Bottom inline button removed

The existing inline "New Game" button at the bottom of the card grid SHALL be removed. It is replaced by the FAB on mobile and the top-positioned inline button on desktop.

#### Scenario: No button below cards

- **WHEN** the user scrolls to the bottom of the games index page on any viewport
- **THEN** there SHALL be no "New Game" button below the card grid
