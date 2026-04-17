## 1. Loader: track draw counts

- [x] 1.1 Add `draws` and `drawsLastFive` variables (initialized to 0) in the loader, alongside the existing player win counters
- [x] 1.2 Add an `else` branch to the existing win-tracking `if/else if` block to increment `draws` (and `drawsLastFive` when `index < 5`) when scores are equal
- [x] 1.3 Return `draws` and `drawsLastFive` in the loader JSON response

## 2. UI: add Draws column to stat cards

- [x] 2.1 Update the "All-Time Record" card to add a Draws column after the Player 2 column — include a `-` separator and the draw count styled with `text-gray-500`
- [x] 2.2 Update the "Last 5 Games" card with the same Draws column layout

## 3. Tests

- [x] 3.1 Add a test for the loader verifying `draws` and `drawsLastFive` are returned correctly when games include draws
- [x] 3.2 Add a test verifying draws count is 0 when no games are drawn
