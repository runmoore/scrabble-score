## ADDED Requirements

### Requirement: Compare page loader uses single query

The compare page loader SHALL compute player total scores from the data already returned by `getAllGames` rather than issuing individual `getGame` calls per relevant game.

#### Scenario: Two players with shared games

- **WHEN** the compare page loads for two players who share N games
- **THEN** the loader SHALL execute exactly one database query (`getAllGames`) regardless of N

#### Scenario: Loader output shape is preserved

- **WHEN** the loader computes total scores inline
- **THEN** the returned data SHALL conform to the existing `EnhancedGame` type with `PlayerWithScores` including `totalScore` and `place` fields

#### Scenario: Total score accuracy

- **WHEN** a player has multiple score entries in a game
- **THEN** the inline `totalScore` computation SHALL produce the same result as `getGame`'s existing computation (sum of all `points` for that player in that game)
