## Why

The new game page uses `max-w-lg` (~512px) centred on screen, which works well on mobile but looks like a narrow column floating in empty space on desktop. Other pages in the app already adapt to wider viewports (games index uses responsive grid, play page uses side-by-side layout), so the new game page feels inconsistent and underutilises available space.

## What Changes

- At the `lg:` breakpoint, place the Game Type and Players Card sections side-by-side in a two-column grid layout
- The Start Game button spans full width below both cards
- Remove the fixed `max-w-lg` constraint on desktop, replacing with a wider max-width (e.g., `max-w-4xl`) that accommodates the two-column layout
- Mobile layout remains unchanged — single column, same as today

## Capabilities

### New Capabilities

_(none — this is a layout enhancement to an existing page)_

### Modified Capabilities

- `new-game-ui`: Adding responsive desktop layout requirement — at `lg:` breakpoint, the two Card sections display side-by-side instead of stacked

## Impact

- `app/routes/games/new.tsx` — layout wrapper changes (Tailwind classes only)
- No server-side, data model, or API changes
- No new dependencies
