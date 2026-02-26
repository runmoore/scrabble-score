## 1. Database Schema & Migration

- [x] 1.1 Add `GameType` model to `prisma/schema.prisma` with `id`, `name`, `userId` fields and relation to `User` (following the `Player` pattern)
- [x] 1.2 Add optional `gameType` relation and `gameTypeId` field to the `Game` model
- [x] 1.3 Run `npx prisma migrate dev` to create and apply the migration

## 2. Server-Side Model Functions

- [x] 2.1 Add `getAllGameTypes({ userId })` function to `app/models/game.server.ts`
- [x] 2.2 Add `addGameType({ userId, name })` function to `app/models/game.server.ts`
- [x] 2.3 Update `createGame()` to accept an optional `gameTypeId` parameter and connect the game type
- [x] 2.4 Update `getGame()` to include `gameType` in the query select/include
- [x] 2.5 Update `getAllGames()` to include `gameType` in the query select/include
- [x] 2.6 Export `GameType` Prisma type from `game.server.ts`

## 3. New Game Page — Game Type Selection UI

- [x] 3.1 Update the loader in `app/routes/games/new.tsx` to fetch game types via `getAllGameTypes()`
- [x] 3.2 Add game type radio buttons (with `name="gameTypeId"`) inside the existing start-game `<Form>`, above the player selection (with "N/A" selected by default)
- [x] 3.3 Add "add new game type" inline form (text input + submit button) following the player add pattern
- [x] 3.4 Add `add-game-type` action handler to create a new game type with empty-name validation
- [x] 3.5 Update the `start-new-game` action to read `gameTypeId` from form data — treat empty string (from the "N/A" radio) as null, and pass the value to `createGame()` which only connects the game type when a valid ID is present

## 4. Game Type Display — Games List

- [x] 4.1 Update the games list in `app/routes/games.tsx` to display game type name before the date when present (format: "{emoji} {GameType} - {Date}")

## 5. Game Type Display — Play Screen & Summary

- [x] 5.1 Update `app/routes/games/$gameId.play.$playerId.tsx` to display the game type as a label/header when present
- [x] 5.2 Update `app/routes/games/$gameId.tsx` to display the game type as a label/header when present

## 6. Tests

- [x] 6.1 Add unit tests for the new server model functions (`getAllGameTypes`, `addGameType`, updated `createGame`)
- [x] 6.2 Update existing unit tests in `app/routes/games/new.test.tsx` for the new action handlers and loader data
- [x] 6.3 Update existing e2e tests to include game type selection in the new game flow (prefer extending existing test cases over creating new test files)
- [x] 6.4 Update existing e2e tests to verify game type display on play screen and game summary

## 7. Code Quality

- [x] 7.1 Run `npm run lint`, `npm run typecheck`, and `npm run format` — fix any issues
