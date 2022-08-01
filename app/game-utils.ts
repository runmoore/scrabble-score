import type { Player } from "./models/game.server";

export function getNextPlayerToPlay({
  scores,
  players,
}: {
  scores: any[];
  players: any[];
}): Player {
  return players[scores.length % players.length];
}
