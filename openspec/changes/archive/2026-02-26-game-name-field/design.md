## Context

The app currently tracks games identified only by creation date. Games span multiple board/card game types (Scrabble, Sushi Go, Molkky) but there is no way to label them by type. The existing `Player` model provides a proven pattern for reusable, user-owned entities with inline creation — we will replicate this pattern for game types.

Current new game flow: select players → start game. New flow: optionally select game type → select players → start game.

## Goals / Non-Goals

**Goals:**

- Add a `GameType` model following the established `Player` pattern (reusable, user-owned)
- Allow optional game type selection on the new game page, with inline creation of new types
- Display game type across all game views (list, play screen, summary)
- Lay groundwork for future filtering and statistical analysis by game type

**Non-Goals:**

- Game type management screen (edit/delete) — future enhancement
- Adding game type to existing nameless games — future enhancement
- Filtering or statistics by game type — future enhancement
- Default/seeded game types — list starts empty, user builds over time

## Decisions

### 1. Data model: Separate `GameType` entity vs. free-text field on `Game`

**Choice**: Separate `GameType` model with one-to-many relationship to `Game`

**Rationale**: Follows the `Player` pattern already established in the codebase. A separate entity enables reuse across games, consistent naming (no typos/duplicates), and future features like filtering and stats. A free-text field would be simpler but leads to inconsistency and makes aggregation difficult.

**Alternatives considered**:

- Free-text `name` field on `Game` — simpler but no reusability, typo-prone, poor for future analytics
- Enum/fixed list — too rigid, users need to define their own game types

### 2. Relationship: One-to-many vs. many-to-many

**Choice**: One-to-many (`GameType` has many `Game`s, each `Game` has zero or one `GameType`)

**Rationale**: A game session is always one type of game. Many-to-many adds unnecessary complexity. The optional foreign key (`gameTypeId`) on `Game` allows games to exist without a type, maintaining backward compatibility.

### 3. UI pattern: Radio buttons for single selection

**Choice**: Radio buttons for game type selection (vs. checkboxes for players)

**Rationale**: Each game has exactly one type (single-select), so radio buttons are the correct input control. Players use checkboxes because multiple are selected. Include a "None" option to allow skipping. The "add new type" form mirrors the "add new player" form.

### 4. UI placement: Game type before players

**Choice**: Game type selection section appears above player selection on `/games/new`

**Rationale**: User preference — pick what you're playing first, then who's playing. Also follows a logical top-down flow: type → players → start.

### 5. Display format in games list

**Choice**: "Game Type - Date" format, falling back to date only when no type is set

**Rationale**: Game type is the primary identifier users care about. Example: "🎯 Scrabble - 24th Feb 2026" for in-progress, "🏆 Scrabble - 24th Feb 2026" for completed.

## Risks / Trade-offs

- **[Optional field complexity]** → The game type is optional, so all display logic must handle the absent case gracefully. Mitigation: consistent null-check pattern, fallback to date-only display.
- **[No deduplication]** → Users could create "Scrabble" and "scrabble" as separate types. Mitigation: acceptable for now; a future management screen could handle merging. Keep it simple.
- **[Migration on existing data]** → Existing games will have `gameTypeId: null`. Mitigation: field is optional by design, no data migration needed beyond schema change.
