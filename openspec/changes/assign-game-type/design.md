## Context

The `game-name-field` change added a `GameType` model and the ability to assign a game type when creating a new game. However, games created before that feature (or where the user skipped selection) have no game type. The original design explicitly listed "Adding game type to existing nameless games" as a non-goal/future enhancement. This change implements that enhancement.

The existing codebase has:

- `GameType` model with `id`, `name`, `userId` (user-owned, reusable)
- Optional `gameTypeId` foreign key on `Game`
- `getGame()` already includes `gameType` in its query
- `getAllGameTypes()` to fetch user's game types
- `addGameType()` to create new game types (on the new game page)
- Game type display on summary page, play screen, and games list (all handle null gracefully)

## Goals / Non-Goals

**Goals:**

- Allow users to set a game type on existing typeless games from both the game summary and play screen
- Select from existing game types only (new types are created on the new game page)
- One-way assignment only (set, not change or clear)

**Non-Goals:**

- Changing an already-set game type — future enhancement
- Clearing/removing a game type — future enhancement
- Bulk assignment of game types to multiple games
- Game type management screen (edit/delete)

## Decisions

### 1. UI approach: Inline assignment section vs. modal/dialog

**Choice**: Inline section that appears where the game type heading would normally be, shown only when `game.gameType` is null.

**Rationale**: Consistent with how the new game page works — game types are selected inline, not in a modal. The section replaces itself with the game type heading once set, providing clear visual feedback. Keeps the UI simple and avoids adding modal complexity.

**Alternatives considered**:

- Modal/dialog — adds complexity, inconsistent with existing inline patterns
- Separate settings page — too heavy for a single field update

### 2. Server function: Dedicated `setGameType` vs. generic `updateGame`

**Choice**: Dedicated `setGameType(gameId, userId, gameTypeId)` function that only sets game type on typeless games.

**Rationale**: Follows the existing pattern of focused functions (`completeGame`, `reopenGame`, `deleteGame`). A guard clause ensures it only operates on games with `gameTypeId: null`, enforcing the one-way-set constraint at the data layer. A generic update function would be over-engineered for this single field.

### 3. Loader data: Fetching game types on summary/play pages

**Choice**: Conditionally load game types in the loader only when `game.gameType` is null.

**Rationale**: Avoids fetching unnecessary data for games that already have a type. The loader already fetches the game, so checking `gameType` is cheap. Both the summary page and play screen loaders need to be updated to optionally include game types.

### 4. No inline game type creation on summary/play pages

**Choice**: Only allow selecting from existing game types. New game types are created on the new game page.

**Rationale**: Duplicating the creation form on the summary and play screens adds clutter without clear benefit. Users already have a dedicated place to create game types (the new game page). Keeping the assignment UI to just a label + buttons keeps it compact and focused.

## Risks / Trade-offs

- **[Loader complexity]** → Both the summary and play screen loaders now conditionally fetch game types. Mitigation: simple null check, minimal overhead.
- **[Action handlers growing]** → Both routes gain a new `set-game-type` action case. Mitigation: each case is straightforward (2-3 lines of logic), acceptable complexity.
- **[One-way constraint]** → Users cannot undo a game type assignment. Mitigation: the assignment UI only appears for typeless games, so the constraint is clear. Changing/clearing game types is a separate future feature.
