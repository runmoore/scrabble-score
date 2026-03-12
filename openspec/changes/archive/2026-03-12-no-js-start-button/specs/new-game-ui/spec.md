## MODIFIED Requirements

### Requirement: Start game button with player count

The "Start Game" button SHALL always be enabled and submittable, regardless of how many players are selected. The button SHALL NOT use the HTML `disabled` attribute.

When JavaScript is available, the button SHALL display dynamic text reflecting the number of selected players. When JavaScript is unavailable, the button SHALL display static text "Start Game".

When fewer than 2 players are selected and JavaScript is available, the button SHALL apply a visually muted style (reduced opacity) to indicate that more players are needed, but SHALL remain clickable.

#### Scenario: Server-rendered HTML (no JavaScript)

- **WHEN** the page is rendered without JavaScript
- **THEN** the Start Game button SHALL be enabled (no `disabled` attribute)
- **AND** the button text SHALL be "Start Game"
- **AND** the button SHALL submit the form when clicked

#### Scenario: Fewer than 2 players selected (JavaScript available)

- **WHEN** JavaScript is available and the user has selected fewer than 2 players
- **THEN** the button text SHALL display "Select at least 2 players"
- **AND** the button SHALL have reduced opacity to appear visually muted
- **AND** the button SHALL remain clickable (not disabled)

#### Scenario: 2 or more players selected (JavaScript available)

- **WHEN** JavaScript is available and the user has selected 2 or more players
- **THEN** the button SHALL display "Start Game (N players)" where N is the count
- **AND** the button SHALL have full opacity with a `green-primary` background

#### Scenario: Submitting with fewer than 2 players

- **WHEN** the user submits the form with fewer than 2 players selected
- **THEN** the server SHALL return a validation error (HTTP 400)
- **AND** the error message SHALL be displayed inline on the page in red text (`text-red-500 dark:text-red-400`)
- **AND** the page SHALL NOT navigate to an error boundary

#### Scenario: Submitting with 0 players selected

- **WHEN** the user submits the form with no players selected
- **THEN** the server SHALL return the same validation error as submitting with 1 player
- **AND** the error message SHALL be displayed inline on the page
