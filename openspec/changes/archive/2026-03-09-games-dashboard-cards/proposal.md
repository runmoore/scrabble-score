## Why

The /games index page is the app's de facto home screen, but it currently shows only a bare list of in-progress games with minimal information. The compare page already demonstrates a rich card-based layout with stats — the games page should match that level of polish and information density, giving users an at-a-glance dashboard when they open the app.

## What Changes

- Replace the plain in-progress games list with individual **game cards** showing player names, time since game started, game type, and current scores
- Add a **total completed games** summary card
- Add a **last completed game** card featuring the game leaderboard (reusing the existing score display pattern from the game summary page)
- Extract the leaderboard display from the game summary route into a shared component so it can be reused on the dashboard

## Capabilities

### New Capabilities

- `games-dashboard`: Card-based games index page with in-progress game cards, completed games count card, and last completed game card with leaderboard

### Modified Capabilities

- `completed-game-scores`: Extract the leaderboard/podium display into a shared component for reuse on both the game summary page and the games dashboard

## Impact

- **Routes**: `app/routes/games/index.tsx` — significant UI rewrite
- **Components**: New shared leaderboard component extracted from `app/routes/games/$gameId.tsx`
- **Models**: `app/models/game.server.ts` — may need a new query or loader adjustments to fetch the last completed game with scores and total completed count
- **Existing pages**: Game summary page (`$gameId.tsx`) refactored to use the shared leaderboard component (no behavior change)
