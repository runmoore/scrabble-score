import { prisma } from "~/db.server";

import type { Game, Player, User, Score } from "@prisma/client";
export type { Game, GameType, Player, User, Score } from "@prisma/client";

interface PlayerWithScores extends Player {
  scores: Score[];
  totalScore: number;
  place?: number;
}

type EnhancedGame = {
  id: Game["id"];
  completed: Game["completed"];
  scores: Score[];
  players: PlayerWithScores[];
  createdAt: Game["createdAt"];
  gameType: { id: string; name: string } | null;
};

function enrichPlayerScores(
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

type PlayerWithPlace = PlayerWithScores & { place: number };
type RankedGame = Omit<EnhancedGame, "players"> & {
  players: PlayerWithPlace[];
};

export function assignPlaces(players: PlayerWithScores[]): PlayerWithPlace[] {
  const sorted = [...players].sort((a, b) =>
    a.totalScore >= b.totalScore ? -1 : 1
  );

  return sorted.map((player, i) => ({
    ...player,
    place:
      i === 0
        ? 1
        : player.totalScore === sorted[i - 1].totalScore
        ? (sorted[i - 1] as PlayerWithPlace).place
        : i + 1,
  }));
}

export async function getGame({
  id,
}: {
  id: Game["id"];
}): Promise<EnhancedGame | null> {
  const game = (await prisma.game.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      completed: true,
      players: true,
      scores: true,
      createdAt: true,
      gameType: { select: { id: true, name: true } },
    },
  })) as EnhancedGame;

  if (!game) {
    return null;
  }

  game.players = enrichPlayerScores(game.players, game.scores);

  return game;
}

export async function getLastCompletedGame({
  userId,
}: {
  userId: User["id"];
}): Promise<RankedGame | null> {
  const game = (await prisma.game.findFirst({
    where: { userId, completed: true, deletedAt: null, players: { some: {} } },
    select: {
      id: true,
      completed: true,
      players: true,
      scores: true,
      createdAt: true,
      gameType: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })) as EnhancedGame;

  if (!game) {
    return null;
  }

  return {
    ...game,
    players: assignPlaces(enrichPlayerScores(game.players, game.scores)),
  };
}

export function createGame({
  userId,
  players,
  gameTypeId,
}: {
  userId: string;
  players: string[];
  gameTypeId?: string | null;
}) {
  return prisma.game.create({
    data: {
      players: {
        connect: players.map((id) => ({ id })),
      },
      user: {
        connect: {
          id: userId,
        },
      },
      gameType: gameTypeId ? { connect: { id: gameTypeId } } : undefined,
    },
  });
}

export function getAllGames({ userId }: { userId: User["id"] }) {
  return prisma.game.findMany({
    where: {
      userId,
      deletedAt: null,
      // only return games with players
      // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#filter-on-presence-of-related-records
      players: {
        some: {},
      },
    },
    select: {
      id: true,
      players: true,
      createdAt: true,
      completed: true,
      scores: true,
      gameType: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getAllGameTypes({ userId }: { userId: User["id"] }) {
  return prisma.gameType.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
}

export function addGameType({
  userId,
  name,
}: {
  userId: User["id"];
  name: string;
}) {
  return prisma.gameType.create({
    data: {
      name,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function getAllPlayers({ userId }: { userId: User["id"] }) {
  return prisma.player.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
}

export function getPlayer({
  id,
  userId,
}: {
  id: Player["id"];
  userId: User["id"];
}) {
  return prisma.player.findFirst({
    where: { id, userId },
    select: { name: true },
  });
}

export function addPlayer({
  userId,
  name,
}: {
  userId: User["id"];
  name: string;
}) {
  return prisma.player.create({
    data: {
      name,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function addScore({
  score,
  gameId,
  playerId,
}: {
  score: number;
  gameId: string;
  playerId: string;
}) {
  return prisma.score.create({
    data: {
      points: score,
      game: {
        connect: {
          id: gameId,
        },
      },
      player: {
        connect: {
          id: playerId,
        },
      },
    },
  });
}

export function completeGame(id: Game["id"]) {
  return prisma.game.update({
    data: { completed: true },
    where: { id },
  });
}

export function reopenGame(id: Game["id"]) {
  return prisma.game.update({
    data: { completed: false },
    where: { id },
  });
}

export function setGameType({
  id,
  userId,
  gameTypeId,
}: {
  id: Game["id"];
  userId: User["id"];
  gameTypeId: string;
}) {
  return prisma.game.update({
    data: { gameTypeId },
    where: { id, userId, gameTypeId: null },
  });
}

export function deleteGame({
  id,
  userId,
}: {
  id: Game["id"];
  userId: User["id"];
}) {
  return prisma.game.update({
    data: { deletedAt: new Date() },
    where: { id, userId },
  });
}

export type { EnhancedGame, PlayerWithScores };
