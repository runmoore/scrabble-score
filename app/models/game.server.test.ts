import {
  getGame,
  getLastCompletedGame,
  getTopGameTypes,
  getTopPlayers,
  setGameType,
} from "./game.server";
import { prisma } from "~/db.server";

import type { EnhancedGame } from "~/game-utils";

vi.mock("~/db.server", () => {
  return {
    prisma: {
      game: {
        findFirst: vi.fn().mockResolvedValue({
          id: "123",
          completed: false,
          createdAt: new Date("2026-01-01"),
          gameType: null,
          players: [
            { id: "1", name: "Player 1", userId: "user-1" },
            { id: "2", name: "Player 2", userId: "user-1" },
          ],
          scores: [
            {
              id: "sc1",
              playerId: "1",
              gameId: "123",
              points: 1,
              scoredAt: new Date("2026-01-01"),
            },
            {
              id: "sc2",
              playerId: "2",
              gameId: "123",
              points: 2,
              scoredAt: new Date("2026-01-01"),
            },
            {
              id: "sc3",
              playerId: "1",
              gameId: "123",
              points: 10,
              scoredAt: new Date("2026-01-01"),
            },
            {
              id: "sc4",
              playerId: "2",
              gameId: "123",
              points: 20,
              scoredAt: new Date("2026-01-01"),
            },
          ],
        }),
        update: vi.fn().mockResolvedValue({ id: "123", gameTypeId: "gt-1" }),
        groupBy: vi.fn().mockResolvedValue([]),
      },
      gameType: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      player: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
  };
});

describe("game.server getGame", () => {
  let result: EnhancedGame;

  beforeEach(async () => {
    result = (await getGame({ id: "123" })) as EnhancedGame;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("calls prisma findFirst", () => {
    expect(prisma.game.findFirst).toHaveBeenCalledWith({
      where: { id: "123", deletedAt: null },
      select: {
        id: true,
        completed: true,
        createdAt: true,
        players: true,
        scores: true,
        gameType: { select: { id: true, name: true } },
      },
    });
  });

  test("returns the total score for each player", async () => {
    expect(result.players[0].totalScore).toEqual(11);
    expect(result.players[1].totalScore).toEqual(22);
  });
});

describe("game.server getLastCompletedGame", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("queries for last completed game and returns with computed totals and places", async () => {
    vi.mocked(prisma.game.findFirst).mockResolvedValueOnce({
      id: "456",
      completed: true,
      createdAt: new Date("2026-01-01"),
      gameType: { id: "gt-1", name: "Scrabble" },
      players: [
        { id: "p1", name: "Alice", userId: "user-1" },
        { id: "p2", name: "Bob", userId: "user-1" },
      ],
      scores: [
        {
          id: "s1",
          playerId: "p1",
          gameId: "456",
          points: 30,
          scoredAt: new Date("2026-01-01"),
        },
        {
          id: "s2",
          playerId: "p2",
          gameId: "456",
          points: 50,
          scoredAt: new Date("2026-01-01"),
        },
        {
          id: "s3",
          playerId: "p1",
          gameId: "456",
          points: 20,
          scoredAt: new Date("2026-01-01"),
        },
        {
          id: "s4",
          playerId: "p2",
          gameId: "456",
          points: 10,
          scoredAt: new Date("2026-01-01"),
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma's generic return type doesn't narrow through mocks
    } as any);

    const result = await getLastCompletedGame({ userId: "user-1" });

    expect(prisma.game.findFirst).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        completed: true,
        deletedAt: null,
        players: { some: {} },
      },
      select: {
        id: true,
        completed: true,
        createdAt: true,
        players: true,
        scores: true,
        gameType: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    expect(result).not.toBeNull();
    // Bob has 60, Alice has 50 — Bob should be first
    expect(result!.players[0].name).toBe("Bob");
    expect(result!.players[0].totalScore).toBe(60);
    expect(result!.players[0].place).toBe(1);
    expect(result!.players[1].name).toBe("Alice");
    expect(result!.players[1].totalScore).toBe(50);
    expect(result!.players[1].place).toBe(2);
  });

  test("returns null when no completed games exist", async () => {
    vi.mocked(prisma.game.findFirst).mockResolvedValueOnce(null);

    const result = await getLastCompletedGame({ userId: "user-1" });

    expect(result).toBeNull();
  });
});

describe("game.server setGameType", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("calls prisma update with gameTypeId and null guard", async () => {
    await setGameType({
      id: "game-1",
      userId: "user-1",
      gameTypeId: "gt-1",
    });

    expect(prisma.game.update).toHaveBeenCalledWith({
      data: { gameTypeId: "gt-1" },
      where: { id: "game-1", userId: "user-1", gameTypeId: null },
    });
  });
});

describe("game.server getTopGameTypes", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("returns game types ranked by count", async () => {
    vi.mocked(prisma.gameType.findMany).mockResolvedValueOnce([
      { id: "gt-1", name: "Scrabble", _count: { games: 5 } },
      { id: "gt-2", name: "Words", _count: { games: 3 } },
      { id: "gt-3", name: "Empty", _count: { games: 0 } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma's generic return type doesn't narrow through mocks
    ] as any);

    const result = await getTopGameTypes({ userId: "user-1", limit: 3 });

    expect(prisma.gameType.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: {
        id: true,
        name: true,
        _count: {
          select: { games: { where: { deletedAt: null } } },
        },
      },
    });

    expect(result).toEqual([
      { gameTypeId: "gt-1", name: "Scrabble", count: 5 },
      { gameTypeId: "gt-2", name: "Words", count: 3 },
    ]);
  });

  test("returns empty array when no game types have games", async () => {
    vi.mocked(prisma.gameType.findMany).mockResolvedValueOnce([]);

    const result = await getTopGameTypes({ userId: "user-1" });

    expect(result).toEqual([]);
  });
});

describe("game.server getTopPlayers", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("returns players ranked by game count", async () => {
    vi.mocked(prisma.player.findMany).mockResolvedValueOnce([
      {
        id: "p1",
        name: "Alice",
        games: [{ id: "g1" }, { id: "g2" }, { id: "g3" }],
      },
      { id: "p2", name: "Bob", games: [{ id: "g1" }, { id: "g2" }] },
      { id: "p3", name: "Carol", games: [{ id: "g1" }] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma's generic return type doesn't narrow through mocks
    ] as any);

    const result = await getTopPlayers({ userId: "user-1", limit: 3 });

    expect(result).toEqual([
      { playerId: "p1", name: "Alice", count: 3 },
      { playerId: "p2", name: "Bob", count: 2 },
      { playerId: "p3", name: "Carol", count: 1 },
    ]);
  });

  test("excludes players with zero games", async () => {
    vi.mocked(prisma.player.findMany).mockResolvedValueOnce([
      { id: "p1", name: "Alice", games: [{ id: "g1" }] },
      { id: "p2", name: "Bob", games: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma's generic return type doesn't narrow through mocks
    ] as any);

    const result = await getTopPlayers({ userId: "user-1" });

    expect(result).toEqual([{ playerId: "p1", name: "Alice", count: 1 }]);
  });

  test("returns empty array when no players have games", async () => {
    vi.mocked(prisma.player.findMany).mockResolvedValueOnce([]);

    const result = await getTopPlayers({ userId: "user-1" });

    expect(result).toEqual([]);
  });
});
