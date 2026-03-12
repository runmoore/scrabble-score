## Why

Users can currently create multiple players or game types with identical names, leading to confusion when selecting them during game setup. Server-side validation should reject duplicate names the same way it rejects blank names — with inline error messages that keep the form open.

## What Changes

- Add server-side duplicate name checking when creating a player (case-insensitive, per-user scope)
- Add server-side duplicate name checking when creating a game type (case-insensitive, per-user scope)
- Return validation errors in the same `{ errors: string }` format used by existing blank-name validation
- Display duplicate-name errors inline using the same red text pattern as blank-name errors
- Keep the add form open on duplicate error, consistent with existing error behavior

## Capabilities

### New Capabilities

_(none — this extends existing validation, not a new capability)_

### Modified Capabilities

- `new-game-ui`: Adding duplicate name validation errors to the inline add-player and add-game-type forms, extending the existing error handling requirements

## Impact

- `app/routes/games/new.tsx`: Action function gains duplicate checks before `addPlayer()` and `addGameType()` calls
- `app/models/game.server.ts`: May add query helpers to check for existing names by userId
- `app/routes/games/new.test.tsx`: New test cases for duplicate name rejection
- No database schema changes — validation is query-based, not constraint-based
- No UI component changes — errors already render from fetcher data
