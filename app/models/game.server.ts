import { prisma } from "~/db.server";

import type { Game, Player, User, Score } from "@prisma/client";
export type { Game, Player, User, Score } from "@prisma/client";

interface PlayerWithScores extends Player {
  scores: Score[];
  totalScore: number;
}

interface PlayerWithScores extends Player {
  scores: Score[];
  totalScore: number;
  place: number;
}

type EnhancedGame = {
  id: Game["id"];
  completed: Game["completed"];
  scores: Score[];
  players: PlayerWithScores[];
  createdAt: Game["createdAt"];
};

export async function getGame({
  id,
}: {
  id: Game["id"];
}): Promise<EnhancedGame | null> {
  const game = (await prisma.game.findFirst({
    where: { id },
    select: {
      id: true,
      completed: true,
      players: true,
      scores: true,
      createdAt: true,
    },
  })) as EnhancedGame;

  if (!game) {
    return null;
  }

  for (let i = 0; i < game.players.length; i++) {
    const player: PlayerWithScores = {
      ...game.players[i],
      scores: [],
      totalScore: 0,
    };

    player.scores = game.scores
      .filter((score) => score.playerId === player.id)
      .map((score) => score);

    player.totalScore = player.scores.reduce(
      (total, current) => (total += current.points),
      0
    );
    game.players[i] = player;
  }

  return game;
}

export function createGame({
  userId,
  players,
}: {
  userId: string;
  players: string[];
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
    },
  });
}

export function getAllGames({ userId }: { userId: User["id"] }) {
  return prisma.game.findMany({
    where: {
      userId,
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
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getAllPlayers({ userId }: { userId: User["id"] }) {
  return prisma.player.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
}

export function getPlayer({ id }: { id: Player["id"] }) {
  return prisma.player.findFirst({
    // TODO: add userId
    where: { id },
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

export type { EnhancedGame, PlayerWithScores };
