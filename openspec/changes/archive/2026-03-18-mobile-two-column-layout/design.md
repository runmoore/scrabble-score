## Context

The player detail page (`app/routes/games/players.$playerId.tsx`) displays stats cards (Games Played, Win Rate, Average Score, Highest Score, etc.) in a responsive grid. Currently the grid uses `grid-cols-1` at the default (mobile) breakpoint, stepping up to 2 columns at `md:` and 3 at `lg:`.

Since this is a PWA primarily used on iPhone, the single-column mobile layout wastes horizontal space and pushes content below the fold.

## Goals / Non-Goals

**Goals:**

- Use a 2-column grid for stats cards on mobile to improve information density
- Maintain readability of card content at the narrower width

**Non-Goals:**

- Redesigning card content or typography
- Changing tablet/desktop breakpoints beyond what's needed for consistency

## Decisions

- Change `grid-cols-1` to `grid-cols-2` on the stats card grid container — a single Tailwind class change
- Keep `md:grid-cols-2` and `lg:grid-cols-3` unchanged (mobile and tablet now both show 2 columns, desktop shows 3)

## Risks / Trade-offs

- Cards with longer content (e.g., "Average Score" with per-type breakdown) will be narrower on small screens — acceptable since the content is short numeric values
- No risk to functionality; purely visual change
