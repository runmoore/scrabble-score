import { prisma } from "~/db.server";

export type { Game } from "@prisma/client";

export function getGame({ id }) {
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
    select: { id: true, players: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getAllPlayers({ userId }: { userId: User["id"] }) {
  return prisma.player.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
}

export function getPlayer({ id }) {
  return prisma.player.findFirst({
    where: { id },
    select: { name: true },
  });
}

export function addScore({ score, gameId, playerId }) {
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
