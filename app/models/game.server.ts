import { prisma } from "~/db.server";
import {
  assignPlaces,
  enrichPlayerScores,
  type EnhancedGame,
  type RankedGame,
} from "~/game-utils";

import type { Game, Player, User } from "@prisma/client";
export type { Game, GameType, Player, User, Score } from "@prisma/client";

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
    select: { id: true, name: true },
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

export async function getTopGameTypes({
  userId,
  limit = 3,
}: {
  userId: User["id"];
  limit?: number;
}) {
  const gameTypes = await prisma.gameType.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      _count: {
        select: { games: { where: { deletedAt: null } } },
      },
    },
  });

  return gameTypes
    .map((gt) => ({
      gameTypeId: gt.id,
      name: gt.name,
      count: gt._count.games,
    }))
    .filter((gt) => gt.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getTopPlayers({
  userId,
  limit = 3,
}: {
  userId: User["id"];
  limit?: number;
}) {
  const players = await prisma.player.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      games: {
        where: { deletedAt: null },
        select: { id: true },
      },
    },
  });

  return players
    .map((p) => ({
      playerId: p.id,
      name: p.name,
      count: p.games.length,
    }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getAllPlayersWithGameCount({
  userId,
}: {
  userId: User["id"];
}) {
  const players = await prisma.player.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      _count: {
        select: { games: { where: { deletedAt: null } } },
      },
    },
  });

  return players
    .map((p) => ({
      playerId: p.id,
      name: p.name,
      count: p._count.games,
    }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getPlayerGames({
  playerId,
  userId,
}: {
  playerId: string;
  userId: string;
}) {
  return prisma.game.findMany({
    where: {
      userId,
      deletedAt: null,
      players: { some: { id: playerId } },
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
