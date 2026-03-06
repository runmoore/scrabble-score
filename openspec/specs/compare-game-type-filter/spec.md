# Capability: Compare Game Type Filter

## Purpose

Allow users to filter the compare page by game type, so they can view head-to-head stats for a specific type of game (e.g., only Scrabble or only a custom game type).

## Requirements

### Requirement: Game type filter pills on compare page

The compare page SHALL display a horizontal row of pill-style filter buttons between the page title and the stat cards. One pill SHALL appear for each distinct game type present in the two players' shared games. Pills SHALL be horizontally scrollable on mobile if they overflow. Only one pill may be selected at a time (single-select).

#### Scenario: Default state with no URL params

- **WHEN** a user navigates to the compare page without a `type` search param
- **THEN** all pills SHALL appear unselected (visually muted)
- **AND** all games between the two players SHALL be shown, including games with no game type

#### Scenario: No pills shown when no game types exist

- **WHEN** none of the two players' shared games have a game type assigned
- **THEN** the filter pill row SHALL NOT be displayed

#### Scenario: Selecting a game type pill

- **WHEN** a user clicks an unselected game type pill
- **THEN** that pill SHALL become selected (visually filled) and any previously selected pill SHALL become unselected
- **AND** the URL SHALL update to `?type=<gameTypeId>`
- **AND** all stat cards and the games table SHALL show only games of that type (untyped games excluded)

#### Scenario: Switching to a different game type

- **WHEN** a user clicks a different unselected game type pill while one is already selected
- **THEN** the newly clicked pill SHALL become selected and the previously selected pill SHALL become unselected
- **AND** the URL `type` param SHALL update to the new game type ID

#### Scenario: Deselecting the active game type pill

- **WHEN** a user clicks the currently selected game type pill
- **THEN** the pill SHALL become unselected
- **AND** the `type` param SHALL be removed from the URL
- **AND** all games (including untyped) SHALL be shown

### Requirement: URL search param syncs filter state

The compare page filter state SHALL be persisted in the URL via a single `type` search param. The loader SHALL read the `type` search param from the request URL and filter games server-side before computing stats.

#### Scenario: Filter state restored from URL

- **WHEN** a user navigates to a compare page URL containing `?type=<gameTypeId>`
- **THEN** the corresponding game type pill SHALL be selected and stats SHALL reflect only games of that type

#### Scenario: Filter state shareable via URL

- **WHEN** a user copies the compare page URL with an active type filter and shares it
- **THEN** the recipient SHALL see the same filtered view when opening the URL

### Requirement: Stats recalculate based on active filter

All stat cards (All-Time Record, Last 5 Games, Last Game Played, Highest Game Score) SHALL be computed from the filtered game set, not the full game set.

#### Scenario: Filtered stats reflect only matching games

- **WHEN** a user selects a game type filter
- **THEN** the All-Time Record card SHALL show win counts from only games of that type
- **AND** the Last 5 Games card SHALL show recent results from only games of that type
- **AND** the Last Game Played card SHALL show the most recent game of that type
- **AND** the Highest Game Score card SHALL show the highest score from games of that type

#### Scenario: Last 5 Games card visibility with filter

- **WHEN** a game type filter is active and fewer than 6 games match
- **THEN** the Last 5 Games card SHALL NOT be displayed
