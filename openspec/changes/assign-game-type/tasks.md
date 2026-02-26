## 1. Server Model

- [x] 1.1 Add `setGameType` function to `app/models/game.server.ts` that updates a game's `gameTypeId` — only when the game belongs to the user and currently has no game type (`gameTypeId: null`)
- [x] 1.2 Add unit test for `setGameType` in `app/models/game.server.test.ts` covering: successful set on typeless game, no-op on game that already has a type

## 2. Game Summary Page (`games/$gameId.tsx`)

- [x] 2.1 Update loader to fetch user's game types (via `getAllGameTypes`) when the game has no game type — requires adding `requireUserId` to the loader
- [x] 2.2 Add `set-game-type` action case that calls `setGameType` with the selected game type ID
- [x] 2.3 Add `add-and-set-game-type` action case that creates a new game type via `addGameType` and then calls `setGameType` to assign it to the game
- [x] 2.4 Add game type assignment UI — when `game.gameType` is null, show a section with radio buttons for existing game types plus an inline "add new game type" form. When `game.gameType` exists, show the existing read-only heading

## 3. Play Screen (`games/$gameId.play.$playerId.tsx`)

- [x] 3.1 Update loader to fetch user's game types when the game has no game type
- [x] 3.2 Add `set-game-type` and `add-and-set-game-type` action cases matching the summary page pattern
- [x] 3.3 Add game type assignment UI matching the summary page pattern — show assignment section when `game.gameType` is null, read-only heading when set

## 4. End-to-End Tests

- [x] 4.1 Add Cypress e2e test: create a game without a game type, navigate to the game summary, assign an existing game type, verify the type heading appears
- [x] 4.2 Add Cypress e2e test: create a game without a game type, navigate to the play screen, create a new game type inline and assign it, verify the type heading appears
- [x] 4.3 Add Cypress e2e test: verify that the assignment UI does not appear on games that already have a game type

## 5. Validation

- [x] 5.1 Run `npm run lint`, `npm run typecheck`, `npm run format` and fix any issues
