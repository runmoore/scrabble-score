## Context

The game completed page (`$gameId.tsx`) shows final placements, names, and totals but no turn-by-turn breakdown. The play page (`$gameId.play.$playerId.tsx`) renders a detailed score table inline (lines 135-170) showing per-player columns with individual scores, padding for uneven turn counts, and a highlighted total row. This table is not reusable — it's embedded directly in the play route.

The completed page already loads all score data via `getGame()`, so no API or data model changes are needed.

## Goals / Non-Goals

**Goals:**

- Extract the play page's score table into a shared `ScoreTable` component
- Add a toggle on the completed game page to show/hide the score breakdown
- Follow the existing UI conventions (Tailwind utility classes, dark mode, mobile-first)

**Non-Goals:**

- Changing the score table's visual design or adding new data to it
- Adding score editing capabilities on the completed page
- Persisting the open/closed state across page loads

## Decisions

### 1. Extract `ScoreTable` component to `app/components/ScoreTable.tsx`

The score table rendering logic (player columns, individual scores, padded empty rows, total with border) will be extracted into a standalone component. Both the play page and the completed game page will import it.

**Props**: `players` (array of players with scores and totalScore), `topScore` (number for leader highlighting).

**Why not leave inline?** The proposal requires reuse across two routes. A shared component avoids duplication and ensures both pages render scores identically.

### 2. Use client-side `useState` toggle with `<details>`/`<summary>` semantics

The score section will use a simple React `useState` boolean to toggle visibility. The trigger will be a styled button that matches existing UI conventions — not a raw `<details>` element, since those don't animate well and look inconsistent with the rest of the app.

**Default state**: collapsed (hidden). Users tap to reveal.

**Why not `<details>`?** While semantically appropriate, the existing app uses styled buttons throughout. A button with a chevron indicator is more consistent and gives us control over the interaction.

### 3. Place the toggle between the standings table and the action buttons

The scores section will sit after the existing placements/totals block (`my-8` div) and before the action buttons (Re-open, Rematch, Delete). This is the natural place to "expand" the summary into detail.

## Risks / Trade-offs

- **Larger completed page on expand**: For games with many turns, the expanded table could push action buttons below the fold → Acceptable trade-off since it's opt-in and collapsed by default
- **Component extraction may reveal subtle differences**: The play page score table has context-specific styling (e.g., `mb-8`) → Keep layout concerns (margins) in the consuming route, not the component
