## Context

The new game page (`app/routes/games/new.tsx`) currently wraps all content in `max-w-lg` (~512px) centred on screen. This produces a narrow column on desktop viewports while other pages in the app use responsive layouts (grids, flex-row) at wider breakpoints.

The page contains two Card sections (Game Type, Players) followed by a Start Game button — a natural fit for a two-column layout on wider screens.

## Goals / Non-Goals

**Goals:**

- Side-by-side Card layout at `lg:` breakpoint so the page uses available desktop width
- Consistent with existing responsive patterns in the app (games index grid, play page flex-row)
- Zero change to mobile layout

**Non-Goals:**

- Redesigning the Card content or pill components
- Adding intermediate breakpoints (e.g., `md:`) — single breakpoint switch is sufficient
- Changing any server-side logic or data model

## Decisions

### 1. Two-column grid at `lg:` breakpoint

**Choice**: Use `lg:grid lg:grid-cols-2` on the card container, with cards stacked (`flex-col`) below `lg:`.

**Why over alternatives**:

- `lg:flex-row` (play page pattern): Grid gives equal-width columns without needing `flex-1` on each card, and naturally handles unequal content heights with `items-start`.
- Wider `max-w` alone: Doesn't utilise space — just makes a wider single column. The content density warrants two columns.

### 2. Replace `max-w-lg` with `max-w-4xl` on desktop

**Choice**: Change the outer wrapper from `max-w-lg` to `max-w-lg lg:max-w-4xl`.

**Why**: `max-w-4xl` (896px) comfortably fits two cards side-by-side with gap. Mobile retains `max-w-lg` so the single-column layout doesn't stretch too wide on tablets.

### 3. Start Game button spans full width below both columns

**Choice**: Keep the button outside the grid, as a sibling that naturally takes full width.

**Why**: Creates a clear visual flow — choose type (left) → choose players (right) → start (bottom). No extra classes needed; block-level button already spans the container.

## Risks / Trade-offs

- **Cards may have very different heights** → Using `items-start` on the grid so cards size to their own content rather than stretching to match. This is acceptable since the cards are independent sections.
- **Very narrow `lg:` viewports (~1024px)** → Two cards at ~448px each plus gap is tight but workable. Content is pills and short forms, not wide tables.
