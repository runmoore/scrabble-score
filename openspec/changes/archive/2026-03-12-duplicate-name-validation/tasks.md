## 1. Server-side validation

- [x] 1.1 Add duplicate name check to the `add-player` action case in `app/routes/games/new.tsx`: query existing players via `getAllPlayers({ userId })`, compare trimmed input name against existing names using `.toLowerCase()`, and return `{ errors: "player name already exists" }` if a match is found
- [x] 1.2 Add duplicate name check to the `add-game-type` action case in `app/routes/games/new.tsx`: query existing game types via `getAllGameTypes({ userId })`, compare trimmed input name against existing names using `.toLowerCase()`, and return `{ errors: "game type name already exists" }` if a match is found

## 2. Unit tests

- [x] 2.1 Add test case in `app/routes/games/new.test.tsx` for add-player action rejecting a duplicate name (mock `getAllPlayers` to return an existing player with the same name)
- [x] 2.2 Add test case for add-player action rejecting a duplicate name with different casing (e.g., "alice" when "Alice" exists)
- [x] 2.3 Add test case in `app/routes/games/new.test.tsx` for add-game-type action rejecting a duplicate game type name
- [x] 2.4 Add test case for add-game-type action rejecting a duplicate game type name with different casing
