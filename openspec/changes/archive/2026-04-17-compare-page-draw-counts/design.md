## Context

The compare page (`compare.$playerOne.$playerTwo.tsx`) shows head-to-head stats between two players. The loader already iterates over all relevant games and tracks wins per player using a simple `if/else if` on score comparison. The `else` case (equal scores = draw) is currently unhandled — draws are silently dropped.

The UI uses two stat cards ("All-Time Record" and "Last 5 Games") with a `Player1 - Player2` layout using flexbox with `justify-between`.

## Goals / Non-Goals

**Goals:**

- Add draw tracking to the existing loop in the loader (all-time and last-5)
- Add a "Draws" column as the 3rd column in both cards, after both player columns
- Always show the Draws column (even when 0)

**Non-Goals:**

- Changing draw detection logic (equal scores = draw is correct for this app)
- Refactoring the loader loop or card components
- Adding draws to the "All Games" list rows

## Decisions

### Add `draws` and `drawsLastFive` as top-level loader fields

Add these alongside the existing `playerOne`/`playerTwo` response shape rather than nesting inside either player object — draws belong to neither player.

### Append Draws column after both player columns

The current layout is `Player1 - Player2` using flexbox justify-between. Add a third column after Player2 for "Draws" with a `-` separator between Player2 and Draws. Use `text-gray-500` for the draws count to keep it visually neutral compared to the player-colored win counts.

## Risks / Trade-offs

- **3-column layout on narrow screens**: The cards already use `flex justify-between`. Adding a third column keeps the same pattern but reduces horizontal space per column. At iPhone widths (375px) with short names this should be fine. Long player names may need truncation — acceptable since this matches existing behavior.
