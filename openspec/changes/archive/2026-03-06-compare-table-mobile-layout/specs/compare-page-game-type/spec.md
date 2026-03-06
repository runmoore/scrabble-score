## MODIFIED Requirements

### Requirement: Display game type on compare page

The compare page SHALL display the game type name in the All Games table, the Last Game Played card, and the Highest Game Score card. Games without a game type SHALL display no game type text in those locations.

The All Games table SHALL use proportional column widths rather than equal-width columns. The score column SHALL be the widest column. Text in the game type and winner columns SHALL be truncated with ellipsis when it overflows the column width.

The All Games table SHALL NOT include a separate "View" column, as the entire row is a navigable link.

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

#### Scenario: Score column is widest in All Games table

- **WHEN** a user views the All Games table on any viewport
- **THEN** the score column SHALL have the largest proportional width of all columns

#### Scenario: Long text truncates in narrow columns

- **WHEN** a game type name or winner name exceeds the available column width
- **THEN** the text SHALL be truncated with an ellipsis rather than wrapping or breaking the layout

#### Scenario: No View column in All Games table

- **WHEN** a user views the All Games table
- **THEN** there SHALL be no separate "View" column, as each row is a navigable link to the game
