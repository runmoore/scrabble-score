## Why

The app is used to track scores across multiple board and card games (Scrabble, Sushi Go, Molkky, etc.), not just Scrabble. Currently games are identified only by their creation date, making it difficult to distinguish games in the list and impossible to filter or analyze scores by game type. Adding a reusable "game type" label enables quick identification, and lays the groundwork for future statistical analysis and filtering by game type across common player groups.

## What Changes

- Add a new `GameType` model to the database as a reusable, user-owned entity (following the `Player` pattern)
- Add an optional one-to-many relationship from `GameType` to `Game` (each game can have zero or one game type)
- Update the new game page (`/games/new`) with a game type selection section **before** the player selection, following the same UX pattern: pick from existing types or add a new one inline
- Display the game type in the games list (`/games`) as "Game Type - Date" format (falls back to date only if no type set)
- Display the game type on the play screen and completed game summary as a header/label

## Capabilities

### New Capabilities

- `game-typing`: Reusable game type management and selection during game creation, with display across all game views

### Modified Capabilities

## Impact

- **Database**: New `GameType` model, optional `gameTypeId` foreign key on `Game`, Prisma migration required
- **Server models**: New CRUD functions in `game.server.ts` for `GameType`, updates to `createGame()`, `getGame()`, and `getAllGames()` to include game type
- **Routes**: `games/new.tsx` (selection UI), `games/$gameId.play.$playerId.tsx` (display), `games/$gameId.tsx` (display), `games.tsx` (list display)
- **Tests**: Unit and e2e test updates for the new field
