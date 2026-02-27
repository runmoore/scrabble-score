import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "chris";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("test", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  // --- Players ---
  const alex = await prisma.player.create({
    data: { name: "Alex", userId: user.id },
  });
  const nora = await prisma.player.create({
    data: { name: "Nora", userId: user.id },
  });
  const dad = await prisma.player.create({
    data: { name: "Dad", userId: user.id },
  });
  const mum = await prisma.player.create({
    data: { name: "Mum", userId: user.id },
  });
  const sarah = await prisma.player.create({
    data: { name: "Sarah", userId: user.id },
  });

  // --- Game Types ---
  const scrabble = await prisma.gameType.create({
    data: { name: "Scrabble", userId: user.id },
  });
  const bananagrams = await prisma.gameType.create({
    data: { name: "Bananagrams", userId: user.id },
  });
  await prisma.gameType.create({
    data: { name: "Upwords", userId: user.id },
  });

  // --- Helper to create scores with sequential timestamps ---
  async function addScores(
    gameId: string,
    rounds: { playerId: string; points: number }[]
  ) {
    const baseTime = new Date();
    for (let i = 0; i < rounds.length; i++) {
      await prisma.score.create({
        data: {
          points: rounds[i].points,
          playerId: rounds[i].playerId,
          gameId,
          scoredAt: new Date(baseTime.getTime() + i * 60_000), // 1 min apart
        },
      });
    }
  }

  // --- Game 1: Completed 2-player Scrabble (Alex vs Nora) ---
  // A full game with realistic scores. Alex wins narrowly.
  const game1 = await prisma.game.create({
    data: {
      userId: user.id,
      gameTypeId: scrabble.id,
      completed: true,
      createdAt: daysAgo(14),
      players: { connect: [{ id: alex.id }, { id: nora.id }] },
    },
  });
  await addScores(game1.id, [
    { playerId: alex.id, points: 12 },
    { playerId: nora.id, points: 18 },
    { playerId: alex.id, points: 24 },
    { playerId: nora.id, points: 8 },
    { playerId: alex.id, points: 36 }, // triple word
    { playerId: nora.id, points: 22 },
    { playerId: alex.id, points: 14 },
    { playerId: nora.id, points: 28 },
    { playerId: alex.id, points: 11 },
    { playerId: nora.id, points: 19 },
    { playerId: alex.id, points: 42 }, // bingo!
    { playerId: nora.id, points: 15 },
    { playerId: alex.id, points: 7 },
    { playerId: nora.id, points: 33 },
    { playerId: alex.id, points: 16 },
    { playerId: nora.id, points: 10 },
    { playerId: alex.id, points: -4 }, // leftover tiles penalty
    { playerId: nora.id, points: -6 }, // leftover tiles penalty
    // Alex: 12+24+36+14+11+42+7+16-4 = 158
    // Nora: 18+8+22+28+19+15+33+10-6 = 147
  ]);

  // --- Game 2: Completed 3-player Scrabble (Alex, Dad, Mum) ---
  // Dad wins this one convincingly.
  const game2 = await prisma.game.create({
    data: {
      userId: user.id,
      gameTypeId: scrabble.id,
      completed: true,
      createdAt: daysAgo(10),
      players: {
        connect: [{ id: alex.id }, { id: dad.id }, { id: mum.id }],
      },
    },
  });
  await addScores(game2.id, [
    { playerId: alex.id, points: 14 },
    { playerId: dad.id, points: 22 },
    { playerId: mum.id, points: 10 },
    { playerId: alex.id, points: 8 },
    { playerId: dad.id, points: 36 },
    { playerId: mum.id, points: 18 },
    { playerId: alex.id, points: 26 },
    { playerId: dad.id, points: 14 },
    { playerId: mum.id, points: 24 },
    { playerId: alex.id, points: 11 },
    { playerId: dad.id, points: 28 },
    { playerId: mum.id, points: 9 },
    { playerId: alex.id, points: 20 },
    { playerId: dad.id, points: 18 },
    { playerId: mum.id, points: 32 },
    { playerId: alex.id, points: 6 },
    { playerId: dad.id, points: 15 },
    { playerId: mum.id, points: 12 },
    // Alex: 14+8+26+11+20+6 = 85
    // Dad: 22+36+14+28+18+15 = 133
    // Mum: 10+18+24+9+32+12 = 105
  ]);

  // --- Game 3: In-progress 2-player Scrabble (Alex vs Nora) ---
  // Mid-game, about 4 turns each. Nora is currently ahead.
  const game3 = await prisma.game.create({
    data: {
      userId: user.id,
      gameTypeId: scrabble.id,
      completed: false,
      createdAt: daysAgo(1),
      players: { connect: [{ id: alex.id }, { id: nora.id }] },
    },
  });
  await addScores(game3.id, [
    { playerId: alex.id, points: 16 },
    { playerId: nora.id, points: 24 },
    { playerId: alex.id, points: 9 },
    { playerId: nora.id, points: 30 },
    { playerId: alex.id, points: 22 },
    { playerId: nora.id, points: 12 },
    { playerId: alex.id, points: 18 },
    // Alex: 16+9+22+18 = 65 (it's Nora's turn next)
    // Nora: 24+30+12 = 66
  ]);

  // --- Game 4: In-progress 4-player game, just started (Alex, Nora, Dad, Sarah) ---
  // Only a couple of turns in. No game type assigned yet.
  const game4 = await prisma.game.create({
    data: {
      userId: user.id,
      completed: false,
      createdAt: hoursAgo(2),
      players: {
        connect: [
          { id: alex.id },
          { id: nora.id },
          { id: dad.id },
          { id: sarah.id },
        ],
      },
    },
  });
  await addScores(game4.id, [
    { playerId: alex.id, points: 14 },
    { playerId: nora.id, points: 20 },
    { playerId: dad.id, points: 18 },
    { playerId: sarah.id, points: 26 },
    { playerId: alex.id, points: 11 },
    // Nora's turn next
  ]);

  // --- Game 5: Completed Bananagrams game (Alex, Nora, Sarah) ---
  const game5 = await prisma.game.create({
    data: {
      userId: user.id,
      gameTypeId: bananagrams.id,
      completed: true,
      createdAt: daysAgo(7),
      players: {
        connect: [{ id: alex.id }, { id: nora.id }, { id: sarah.id }],
      },
    },
  });
  await addScores(game5.id, [
    { playerId: alex.id, points: 3 },
    { playerId: nora.id, points: 5 },
    { playerId: sarah.id, points: 1 },
    { playerId: alex.id, points: 5 },
    { playerId: nora.id, points: 3 },
    { playerId: sarah.id, points: 1 },
    // Alex: 8, Nora: 8, Sarah: 2
  ]);

  // --- Game 6: Completed Scrabble, no game type (for testing assign flow) ---
  // Alex vs Mum, a quick game.
  const game6 = await prisma.game.create({
    data: {
      userId: user.id,
      completed: true,
      createdAt: daysAgo(3),
      players: { connect: [{ id: alex.id }, { id: mum.id }] },
    },
  });
  await addScores(game6.id, [
    { playerId: alex.id, points: 18 },
    { playerId: mum.id, points: 22 },
    { playerId: alex.id, points: 30 },
    { playerId: mum.id, points: 14 },
    { playerId: alex.id, points: 12 },
    { playerId: mum.id, points: 26 },
    { playerId: alex.id, points: 8 },
    { playerId: mum.id, points: 16 },
    // Alex: 68, Mum: 78
  ]);

  console.log(`Database has been seeded. 🌱`);
  console.log(`  User: chris / test`);
  console.log(`  Players: Alex, Nora, Dad, Mum, Sarah`);
  console.log(`  Game types: Scrabble, Bananagrams, Upwords`);
  console.log(`  Games: 6 (4 completed, 2 in-progress)`);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
