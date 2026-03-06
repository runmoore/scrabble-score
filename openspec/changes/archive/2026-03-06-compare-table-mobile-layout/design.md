## Context

The compare page's "All Games" table has 5 equal-width columns (`flex-1` each): date, game type, winner, score, and "View" link. On iPhone (375px), this gives each column ~65px — too narrow for 3-digit scores like "312 - 287". The entire row is already a clickable `<Link>`, making the "View" text redundant.

## Goals / Non-Goals

**Goals:**

- Give score column proportionally more width than other columns
- Maintain consistent column alignment across all rows
- Reclaim space wasted by the "View" column
- Improve readability on mobile (375px) viewports

**Non-Goals:**

- Changing the table on desktop/tablet — only optimizing the existing layout
- Changing the data displayed (no new fields or removed data)
- Converting to a responsive layout that changes structure at breakpoints

## Decisions

### 1. Remove the "View" column entirely

**Decision**: Remove the "View" text link column rather than replacing it with an icon.

**Rationale**: The entire row is already a `<Link>` component — the "View" text is fully redundant. Adding an icon would still consume horizontal space for no functional benefit. Removing it entirely frees up ~20% of the row width.

**Alternative considered**: Small chevron icon — rejected because it still takes space and the row's clickability is already indicated by the `hover:bg-gray-50` style.

### 2. Use explicit Tailwind width utilities instead of equal flex-1

**Decision**: Replace all `flex-1` classes with specific width classes to give score the most space.

Column width distribution:

- Date: `w-[28%]` — dates like "6th Mar 2026" need moderate space
- Game type: `w-[20%]` — short labels, can truncate
- Winner: `w-[22%]` — player names, can truncate
- Score: `w-[30%]` — widest column for "312 - 287" style scores

**Rationale**: Fixed percentage widths ensure columns stay aligned across rows and give the score column enough room for two 3-digit numbers with a separator.

### 3. Make row hover state more visible on desktop

**Decision**: Change hover from `hover:bg-gray-50` to `hover:bg-blue-50 dark:hover:bg-blue-900/30` to make it clearly distinct from the alternating row backgrounds.

**Rationale**: The current hover is nearly invisible — on even rows (white), `bg-gray-50` is barely perceptible. On odd rows (`bg-gray-50`), hovering to `bg-gray-50` is literally a no-op. A blue-tinted hover clearly signals clickability on desktop. On mobile, hover states don't apply so this has no effect there.

### 4. Truncate text in narrow columns

**Decision**: Add `truncate` (Tailwind's text-overflow: ellipsis) to game type and winner columns so long names don't break the layout.

**Rationale**: Player names and game type names vary in length. Truncation keeps the grid stable without wrapping.

## Risks / Trade-offs

- [Very long player names get truncated] → Acceptable since the full game is viewable by tapping the row
- [Percentage widths are approximate] → At 375px they provide enough differentiation; tested mentally with common score formats
