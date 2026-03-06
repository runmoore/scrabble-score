## Context

The compare page (`games/compare.$playerOne.$playerTwo.tsx`) shows head-to-head stats between two players. The loader already fetches full game data via `getGame()`, which includes `gameType: { id, name } | null` on each game. The game type data is present in `relevantGames` but not rendered anywhere on the page.

The `highestScore` object tracked in the loader currently stores `score`, `playerName`, `gameId`, and `gameDate` — but not `gameTypeName`, so it needs a new field.

## Goals / Non-Goals

**Goals:**

- Display game type in three places on the compare page: All Games table, Last Game Played card, Highest Game Score card
- Handle null game types gracefully (games created before game typing feature)

**Non-Goals:**

- Filtering or grouping compare stats by game type
- Changing the compare page data fetching or model layer

## Decisions

### 1. Game type display in All Games table

**Choice**: Add a new column after the date column showing the game type name, or empty if null.

**Rationale**: The table already has date, winner, score, and view columns. Game type fits naturally after date as contextual metadata about the game. On mobile, the extra column may need to be compact — use `text-sm` and allow truncation.

### 2. Game type in Last Game Played and Highest Game Score cards

**Choice**: Display the game type name as a secondary line near the date, using the same muted text style as the date.

**Rationale**: Both cards already show the date in `text-sm text-gray-600`. The game type can sit alongside or below the date in the same style, keeping the visual hierarchy consistent.

### 3. Tracking game type in highestScore loader data

**Choice**: Add `gameTypeName: string | null` to the `highestScore` object in the loader.

**Rationale**: The Last Game Played card can read game type directly from `relevantGames[0].gameType`, but the Highest Game Score card uses a separate `highestScore` object built during the loop. Adding the field there is the simplest approach — no structural changes needed.

## Risks / Trade-offs

- **[Mobile layout]** → Adding a column to the All Games table may feel cramped on small screens. Mitigation: use compact text sizing and test at 375px viewport.
