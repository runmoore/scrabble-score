## 1. Loader Update

- [x] 1.1 Add `gameTypeName: string | null` field to the `highestScore` object in the loader, populated from `game.gameType?.name ?? null` when tracking the highest score

## 2. All Games Table

- [x] 2.1 Add a game type column after the date column in the All Games table, displaying `game.gameType?.name` or empty for typeless games

## 3. Last Game Played Card

- [x] 3.1 Display the game type name in the Last Game Played card (from `relevantGames[0].gameType?.name`), using the same muted text style as the date

## 4. Highest Game Score Card

- [x] 4.1 Display the game type name in the Highest Game Score card (from `highestScore.gameTypeName`), using the same muted text style as the date

## 5. Validation

- [x] 5.1 Run `npm run lint`, `npm run typecheck`, `npm run format` and fix any issues
