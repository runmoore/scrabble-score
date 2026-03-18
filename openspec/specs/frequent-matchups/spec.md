# Frequent Matchups

## Purpose

Displays the most frequently played player pairs as matchup cards on the compare player-selection page, providing quick navigation to head-to-head comparisons.

## Requirements

### Requirement: Matchup cards displayed on compare player-selection page

The compare player-selection page (`/games/compare`) SHALL display a set of matchup cards above the existing dropdown selectors. Each card SHALL represent a unique pair of players who have played at least one 2-player game against each other. Only completed games SHALL be counted.

#### Scenario: User has player pairs with shared games

- **WHEN** the user visits the compare player-selection page and at least one pair of players has played a completed 2-player game together
- **THEN** matchup cards are displayed as equal-width cards above the dropdown selectors, stacked on mobile and in a responsive grid on wider screens

#### Scenario: User has no 2-player games

- **WHEN** the user visits the compare player-selection page and no pair of players has played a 2-player game together
- **THEN** the matchup cards section is not rendered and the dropdowns remain as the only selection method

### Requirement: Matchup card content

Each matchup card SHALL display:

1. Both player names formatted as "{PlayerA} vs {PlayerB}"
2. The number of head-to-head games played (e.g. "12 games")
3. A comma-separated list of game type names they have played together, displayed in smaller text at the bottom of the card

If the singular "1 game" case applies, the label SHALL read "1 game" (not "1 games"). Game types SHALL be sorted alphabetically. If no games in the pair have a game type assigned, the game types line SHALL be omitted.

#### Scenario: Card displays correct content

- **WHEN** Alex and Nora have played 5 games together with game types "Scrabble" and "Words With Friends"
- **THEN** the card displays "Alex vs Nora", "5 games", and "Scrabble, Words With Friends"

#### Scenario: Single game singular label

- **WHEN** two players have played exactly 1 game together
- **THEN** the card displays "1 game"

#### Scenario: No game types assigned

- **WHEN** none of the games between two players have a game type
- **THEN** the game types line is omitted from the card

### Requirement: Matchup card ordering and limit

Matchup cards SHALL be ordered by the number of games played in descending order (most games first). When two pairs have the same number of games, ordering is unspecified. At most 3 cards SHALL be displayed, showing only the top 3 most-played pairs.

#### Scenario: Cards sorted by game count

- **WHEN** Alex vs Nora have 8 games and Bob vs Claire have 3 games
- **THEN** the Alex vs Nora card appears before the Bob vs Claire card

#### Scenario: More than 3 pairs exist

- **WHEN** 5 different player pairs have played games together
- **THEN** only the top 3 pairs by game count are shown as cards

### Requirement: Matchup card navigation

Clicking a matchup card SHALL navigate the user to the head-to-head comparison page for that player pair (`/games/compare/{playerOneId}/{playerTwoId}`).

#### Scenario: User clicks a matchup card

- **WHEN** the user clicks the card for Alex vs Nora
- **THEN** the browser navigates to the comparison page for Alex and Nora

### Requirement: Matchup data sourced from 2-player games only

The matchup computation SHALL only consider games with exactly 2 players. Games with 1 player or 3+ players SHALL be excluded from matchup counts and game type lists.

#### Scenario: 3-player game excluded

- **WHEN** Alex, Nora, and Bob played a 3-player game together
- **THEN** that game does not count toward any matchup pair
