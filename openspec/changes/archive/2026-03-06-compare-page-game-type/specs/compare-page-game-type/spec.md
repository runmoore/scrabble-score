## ADDED Requirements

### Requirement: Display game type on compare page

The compare page SHALL display the game type name in the All Games table, the Last Game Played card, and the Highest Game Score card. Games without a game type SHALL display no game type text in those locations.

#### Scenario: All Games table shows game type column

- **WHEN** a user views the compare page with games that have game types assigned
- **THEN** the All Games table SHALL include a game type column after the date column showing each game's type name

#### Scenario: All Games table with typeless game

- **WHEN** a game in the All Games table has no game type assigned
- **THEN** the game type column for that row SHALL be empty

#### Scenario: Last Game Played card shows game type

- **WHEN** a user views the Last Game Played card and the last game has a game type
- **THEN** the card SHALL display the game type name

#### Scenario: Highest Game Score card shows game type

- **WHEN** a user views the Highest Game Score card and the highest-scoring game has a game type
- **THEN** the card SHALL display the game type name
