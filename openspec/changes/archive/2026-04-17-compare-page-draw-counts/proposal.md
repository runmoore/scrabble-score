## Why

The compare page shows win counts for each player in the "All-Time Record" and "Last 5 Games" cards, but drawn games are silently excluded. When the two win counts don't add up to the total games played (e.g., 2 + 2 = 4 out of 5 games), users have no way to see that the missing game was a draw. This makes the stats feel incomplete and confusing.

## What Changes

- Add a "Draws" column as the 3rd column (after both player columns) in the "All-Time Record" and "Last 5 Games" cards
- The Draws column is always visible, even when the count is 0
- Track draws in the loader alongside existing win counts
- Display draws with a neutral style (not player-colored) to distinguish them from wins

## Capabilities

### New Capabilities

- `compare-draw-counts`: Track and display draw counts in the All-Time Record and Last 5 Games cards on the player comparison page

### Modified Capabilities

_None — this adds new data to existing cards without changing existing spec requirements._

## Impact

- `app/routes/games/compare.$playerOne.$playerTwo.tsx`: Loader logic to count draws; UI updates to both record cards
- No database changes, no new dependencies
