## Context

The compare page (`compare.$playerOne.$playerTwo.tsx`) shows head-to-head stats and a games table for two players. It currently displays all 2-player games between them regardless of game type. The loader already fetches game type data via the `getGame()` include, and the table already renders game type names. Users who play multiple game types want filtered views.

## Goals / Non-Goals

**Goals:**

- Filter compare page stats and games table by game type via interactive pills
- Sync filter state to URL search params for shareability and persistence across navigation
- Recalculate all stat cards (all-time record, last 5, last game, highest score) based on active filter

**Non-Goals:**

- Persisting filter preferences beyond the URL (no cookies/localStorage)
- Filtering by other dimensions (date range, score threshold, etc.)
- Multi-select filtering (rejected after UX testing — see Decision 5)

## Decisions

### 1. Server-side filtering in the loader

**Decision**: Read `type` search param from `request.url` in the loader and filter `relevantGames` before computing stats.

**Rationale**: The loader already runs on every URL change (including search param changes). Server-side filtering avoids a flash of unfiltered content that would occur with client-side filtering. It also keeps stat computation in the loader where it already lives — no need to move logic to the component.

**Approach**: The loader parses `new URL(request.url).searchParams.get("type")` to get the selected game type ID. If present, `relevantGames` is filtered to only games matching that type before stats are computed. The loader also returns `availableGameTypes` (distinct types from the unfiltered relevant games) so the UI can render pills.

**Alternatives considered**:

- Client-side filtering with `useSearchParams` — rejected because it causes a flash of wrong content on navigation, and requires moving stat computation out of the loader unnecessarily

### 2. URL search param format

**Decision**: Use `?type=<gameTypeId>` for single-select. Absence of `type` param means "all games".

**Rationale**: Single value param is simple and clean. Using ID (not name) avoids encoding issues and is stable if names change. "All games" = no param keeps the default URL clean.

### 3. Navigation method: `useSearchParams` setter

**Decision**: Use `setSearchParams` from Remix's `useSearchParams` hook to update the URL when pills are clicked.

**Rationale**: This replaces only the search params, preserving the route params. Triggers a loader rerun with the new filter. Browser history entry for back/forward.

### 4. Pill UI pattern

**Decision**: Horizontal scrollable row of game type pill buttons only — no "All games" pill. Default state (no URL params) shows all pills unselected and all games visible.

**Selected state**: `bg-blue-primary text-white` (filled). **Unselected state**: `bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300` (outline/muted).

### 5. Single-select over multi-select

**Decision**: Only one game type pill can be active at a time. Clicking a different pill switches the filter; clicking the active pill deselects it (back to all games).

**Rationale**: After live testing multi-select, it created a confusing UX with a "cliff edge" problem — deselecting pills one-by-one narrowed results smoothly, but deselecting the last pill suddenly expanded the view to include untyped games. With typically 2-3 game types between two players, multi-select adds complexity for negligible benefit. Single-select matches established patterns (YouTube topic chips, Spotify genre pills) and provides the clearest mental model: tap to filter, tap again to clear.

**Alternatives considered**:

- Multi-select with additive toggle — rejected after live testing due to cliff-edge UX problem
- Multi-select with "All games" pill — rejected as redundant (unfiltered is the default state)

## Risks / Trade-offs

- **[Games without a game type]** → Untyped games are only visible in the default state (no pill selected). Once a filter is active, untyped games are excluded. Users return to seeing untyped games by tapping the active pill to deselect it.
- **[Cannot combine types]** → Accepted trade-off. With 2-3 game types between two players, the need to combine types is negligible, and the UX simplicity gain outweighs this limitation.
