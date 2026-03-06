## Why

The "All Games" table on the compare page uses five equal-width columns, which makes the layout cramped on mobile (iPhone). Scrabble scores are nearly always 3-digit numbers (100+), and the score column — the most important data — gets the same space as the date, game type, winner, and "View" link. The "View" text link also wastes horizontal space that could be reclaimed.

## What Changes

- Redistribute column widths so the score column gets more space than other columns
- Ensure all rows maintain consistent column alignment (no per-row width shifting)
- Replace or remove the "View" text link — either use a small chevron icon or remove the column entirely since the entire row is already a clickable link
- Tighten horizontal padding to reclaim space on mobile viewports

## Capabilities

### New Capabilities

_None_ — this is a layout refinement of an existing page.

### Modified Capabilities

- `compare-page-game-type`: The compare page table layout is changing to improve mobile readability — column width distribution and the "View" column are being modified.

## Impact

- **Code**: `app/routes/games/compare.$playerOne.$playerTwo.tsx` — the "All Games" table markup (lines ~271-314)
- **No data model changes**: Pure UI/layout change
- **No new dependencies**: Uses existing Tailwind utilities
