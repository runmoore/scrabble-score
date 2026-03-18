## Why

The player overview stats cards stack vertically on mobile (`grid-cols-1`), wasting screen space and requiring excessive scrolling. Switching to a 2-column grid on mobile makes better use of the small screen and lets users see more stats at a glance — consistent with a PWA optimized for iPhone.

## What Changes

- Change the stats card grid on the player detail page from `grid-cols-1` to `grid-cols-2` at mobile breakpoint
- Cards now display side-by-side on all screen sizes, with 2 columns on mobile/tablet and 3 on desktop

## Capabilities

### New Capabilities

_(none — this is a layout refinement, not a new capability)_

### Modified Capabilities

- `player-overview`: Stats card grid layout changes from single-column to two-column on mobile

## Impact

- **Code**: `app/routes/games/players.$playerId.tsx` — single class change on the grid container
- **Visual**: Cards will be narrower on small screens; content must remain readable at ~half viewport width
- **No API, data model, or dependency changes**
