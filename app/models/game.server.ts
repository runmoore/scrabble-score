import { prisma } from "~/db.server";

import type { Game, Player, User } from "@prisma/client";
export type { Game, Player, Score } from "@prisma/client";

export function getGame({ id }: { id: Game["id"] }) {
  return prisma.game.findFirst({
    where: { id },
    select: { id: true, players: true, scores: true },
  });
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
    where: { userId },
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
