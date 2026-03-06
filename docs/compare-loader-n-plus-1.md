# Compare Loader: N+1 Query Problem

## Problem

The compare page loader (`compare.$playerOne.$playerTwo.tsx`) fetches game data in two phases:

1. `getAllGames({ userId })` — fetches all user games with players, scores, and game types
2. `getGame({ id })` — called individually for each relevant game

```ts
const allRelevantGames = (
  await Promise.all(
    allGames
      .filter(/* 2-player games with both players */)
      .map((game) => getGame({ id: game.id }))
  )
).flatMap((game) => (game ? [game] : []));
```

This is a classic N+1 pattern. If two players share 50 games, that's 1 query for `getAllGames` + 50 individual `getGame` queries.

## Why It Exists

`getAllGames` returns raw scores per game, but the loader needs `totalScore` (sum of a player's scores in a game). That computed field is added by `getGame`, which iterates each player's scores and reduces them.

## What `getAllGames` Already Returns

```ts
select: {
  id: true,
  players: true,
  createdAt: true,
  completed: true,
  scores: true,
  gameType: { select: { id: true, name: true } },
}
```

All the raw data is there. The only missing piece is the `totalScore` computation — a simple `reduce` over scores filtered by player ID.

## Proposed Fix

Eliminate the `getGame` calls entirely. After filtering `allGames` to relevant 2-player games, compute `totalScore` inline:

```ts
const allRelevantGames = allGames
  .filter(
    (game) =>
      game.players.length === 2 &&
      game.players.some((p) => p.id === params.playerOne) &&
      game.players.some((p) => p.id === params.playerTwo)
  )
  .map((game) => ({
    ...game,
    players: game.players.map((player) => {
      const playerScores = game.scores.filter((s) => s.playerId === player.id);
      return {
        ...player,
        scores: playerScores,
        totalScore: playerScores.reduce((sum, s) => sum + s.points, 0),
      };
    }),
  }));
```

This reduces N+1 database queries down to 1, with the `totalScore` computation happening in-memory over data we already have.

## Impact

- Eliminates N parallel DB queries per page load
- No change to loader output shape — downstream code is unaffected
- The `getGame` function remains available for other routes that need it
