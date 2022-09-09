import type { Player, Score } from "./models/game.server";

export function getNextPlayerToPlay({
  scores,
  players,
}: {
  scores: Score[];
  players: Player[];
}): Player {
  if (scores.length === 0) {
    return players[0];
  }

  const lastPersonToPlay = scores.at(-1)?.playerId;
  const indexOfLastPersonToPlay = players.findIndex(
    (p) => p.id === lastPersonToPlay
  );

  return indexOfLastPersonToPlay + 1 === players.length
    ? players[0]
    : players[indexOfLastPersonToPlay + 1];
}
