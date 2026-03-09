import type { Game, Player, Score } from "./models/game.server";

export interface PlayerWithScores extends Player {
  scores: Score[];
  totalScore: number;
  place?: number;
}

export type EnhancedGame = {
  id: Game["id"];
  completed: Game["completed"];
  scores: Score[];
  players: PlayerWithScores[];
  createdAt: Game["createdAt"];
  gameType: { id: string; name: string } | null;
};

type PlayerWithPlace = PlayerWithScores & { place: number };
export type RankedGame = Omit<EnhancedGame, "players"> & {
  players: PlayerWithPlace[];
};

export function enrichPlayerScores(
  players: Player[],
  scores: Score[]
): PlayerWithScores[] {
  return players.map((player) => {
    const playerScores = scores.filter((s) => s.playerId === player.id);
    return {
      ...player,
      scores: playerScores,
      totalScore: playerScores.reduce((sum, s) => sum + s.points, 0),
    };
  });
}

export function assignPlaces(players: PlayerWithScores[]): PlayerWithPlace[] {
  const sorted = [...players].sort((a, b) =>
    a.totalScore >= b.totalScore ? -1 : 1
  );

  let currentPlace = 1;
  return sorted.map((player, i) => {
    if (i > 0 && player.totalScore !== sorted[i - 1].totalScore) {
      currentPlace = i + 1;
    }
    return { ...player, place: currentPlace };
  });
}

export function getNextPlayerToPlay({
  scores,
  players,
}: {
  // Omitting scoredAt because the Date object is not serializable and messes up TS checks
  scores: Omit<Score, "scoredAt">[];
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
