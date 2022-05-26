import type { Player, Score } from "./models/game.server";

export function getNextPlayerToPlay({
  scores,
  players,
}: {
  scores: Score[];
  players: Player[];
}): Player {
  return players[scores.length % players.length];
}
