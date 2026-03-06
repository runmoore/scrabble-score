## Why

The compare page shows head-to-head stats between two players but doesn't include game type information anywhere. Since players may play multiple different games (Scrabble, Sushi Go, etc.), knowing which game type each result is from provides important context — especially in the "All Games" table, "Last Game Played" card, and "Highest Game Score" card.

## What Changes

- Add a game type column to the "All Games" table on the compare page, positioned after the date column
- Display the game type name in the "Last Game Played" card
- Display the game type name in the "Highest Game Score" card
- Track game type in the `highestScore` loader data so it's available to the card

## Capabilities

### New Capabilities

### Modified Capabilities

## Impact

- **Routes**: `games/compare.$playerOne.$playerTwo.tsx` — update loader to track game type in `highestScore`, update UI to display game type in three locations (All Games table, Last Game Played card, Highest Game Score card)
- No database, model, or API changes needed — `getGame()` already returns `gameType` data
