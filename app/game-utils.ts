import type { Player, Score } from "./models/game.server";

export function getNextPlayerToPlay({
  scores,
  players,
}: {
  // Omitting scoredAt because the Date object is not serializable and messes up TS checks
  scores: Omit<Score, 'scoredAt'>[];
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
