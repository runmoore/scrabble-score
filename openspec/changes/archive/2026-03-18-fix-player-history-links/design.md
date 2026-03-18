## Context

The player detail page (`/games/players/$playerId`) shows a game history list. Currently all games link to `/games/${game.id}`, but in-progress games at that URL redirect to the play screen. It's better to link directly to the correct destination.

The `getNextPlayerToPlay()` function from `~/game-utils` already determines the next player from scores and players data, and is available for import.

## Goals / Non-Goals

**Goals:**

- In-progress game history rows link directly to `/games/${game.id}/play/${nextPlayerId}`
- Completed game history rows continue linking to `/games/${game.id}`

**Non-Goals:**

- Changing the game summary redirect behavior
- Modifying the play screen itself

## Decisions

**Compute `nextPlayerId` in `buildGameHistory`**: Call `getNextPlayerToPlay()` for each in-progress game and include the result in the history item.

_Rationale_: Keeps the link logic data-driven. The component just reads the field rather than computing turn order.

**Null for completed games**: Set `nextPlayerId: null` for completed games since they don't need the play URL.

_Rationale_: Clean conditional — `if (game.nextPlayerId)` determines the URL pattern.

## Risks / Trade-offs

- [Minimal change] → Only 2 edits in one file. Low risk.
