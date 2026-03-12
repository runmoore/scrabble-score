## Context

The new game page (`app/routes/games/new.tsx`) has inline forms for adding players and game types. These forms already validate blank/whitespace-only names server-side, returning `{ errors: "..." }` which the UI displays as red text below the input. However, nothing prevents creating a player or game type with the same name as an existing one.

The loader already fetches all players and game types for the current user via `getAllPlayers()` and `getAllGameTypes()`. The action handler has access to the same `userId`.

## Goals / Non-Goals

**Goals:**

- Reject duplicate player names per-user with a clear error message
- Reject duplicate game type names per-user with a clear error message
- Case-insensitive comparison (e.g., "Alice" and "alice" are duplicates)
- Match the existing error UX — same format, same form-stays-open behavior

**Non-Goals:**

- Database-level unique constraints (unnecessary complexity for this app scale)
- Cross-user duplicate checking
- Renaming or merging existing duplicates

## Decisions

### Decision 1: Query existing names in the action handler

Check for duplicates by querying the database in the action function, before calling `addPlayer()` / `addGameType()`. This reuses the existing `getAllPlayers()` and `getAllGameTypes()` functions that are already imported.

**Alternative considered**: Add dedicated `findPlayerByName()` / `findGameTypeByName()` functions to `game.server.ts`. Rejected because the existing `getAll*` functions already return `{ id, name }[]` and the list sizes are small enough that filtering in JS is simpler than adding new Prisma queries.

### Decision 2: Case-insensitive comparison via `.toLowerCase()`

Compare trimmed input name against existing names using `.toLowerCase()` on both sides. SQLite supports `COLLATE NOCASE` but doing the comparison in JS keeps it in the action handler alongside the existing blank-name check, with no model layer changes needed.

### Decision 3: Same error response shape

Return `{ errors: "player name already exists" }` and `{ errors: "game type name already exists" }` — same `{ errors: string }` shape used by blank-name validation. The UI already renders any truthy `errors` string as red text, so no frontend changes are needed beyond the form staying open (which already happens for any error).

## Risks / Trade-offs

- **Race condition**: Two simultaneous submissions could both pass the duplicate check. → Acceptable at this app's scale (single user, mobile PWA). No mitigation needed.
- **Extra query per submission**: Each add-player/add-game-type action now queries all names. → Negligible cost given small data sizes and SQLite locality.
