import { loader, isOutrightWinner } from "./players.$playerId";

vi.mock("~/session.server", () => ({
  requireUserId: vi.fn().mockResolvedValue("user-1"),
}));

vi.mock("~/models/game.server", () => ({
  getPlayer: vi.fn().mockResolvedValue({ id: "p1", name: "Alice" }),
  getPlayerGames: vi.fn().mockResolvedValue([]),
}));

const callLoader = (
  playerId: string,
  searchParams?: Record<string, string>
) => {
  const url = new URL("http://localhost/games/players/" + playerId);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      url.searchParams.set(k, v);
    }
  }
  return loader({
    request: new Request(url.toString()),
    params: { playerId },
    context: {},
  });
};

describe("isOutrightWinner", () => {
  test("returns true when player is sole first place", () => {
    const player = { place: 1 };
    const allPlayers = [{ place: 1 }, { place: 2 }, { place: 3 }];
    expect(isOutrightWinner(player, allPlayers)).toBe(true);
  });

  test("returns false when player is tied for first", () => {
    const player = { place: 1 };
    const allPlayers = [{ place: 1 }, { place: 1 }, { place: 3 }];
    expect(isOutrightWinner(player, allPlayers)).toBe(false);
  });

  test("returns false when player is not first", () => {
    const player = { place: 2 };
    const allPlayers = [{ place: 1 }, { place: 2 }];
    expect(isOutrightWinner(player, allPlayers)).toBe(false);
  });

  test("returns false when place is undefined", () => {
    const player = {};
    const allPlayers = [{ place: 1 }, {}];
    expect(isOutrightWinner(player, allPlayers)).toBe(false);
  });
});

describe("players.$playerId loader", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("returns 404 for unknown player", async () => {
    const { getPlayer } = await import("~/models/game.server");
    vi.mocked(getPlayer).mockResolvedValueOnce(null);

    await expect(callLoader("unknown")).rejects.toEqual(
      expect.objectContaining({ status: 404 })
    );
  });

  test("returns empty stats when no games exist", async () => {
    const response = await callLoader("p1");
    const data = await response.json();

    expect(data.player.name).toBe("Alice");
    expect(data.gamesPlayed).toBe(0);
    expect(data.winRate).toBe(0);
    expect(data.history).toEqual([]);
  });

  test("computes win rate excluding ties", async () => {
    const { getPlayerGames } = await import("~/models/game.server");
    vi.mocked(getPlayerGames).mockResolvedValueOnce([
      // Alice wins (higher score)
      {
        id: "g1",
        completed: true,
        createdAt: new Date("2026-01-15"),
        gameType: { id: "gt-scrabble", name: "Scrabble" },
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [
          {
            id: "s1",
            playerId: "p1",
            gameId: "g1",
            points: 100,
            scoredAt: new Date("2026-01-15"),
          },
          {
            id: "s2",
            playerId: "p2",
            gameId: "g1",
            points: 80,
            scoredAt: new Date("2026-01-15"),
          },
        ],
      },
      // Alice loses
      {
        id: "g2",
        completed: true,
        createdAt: new Date("2026-01-15"),
        gameType: { id: "gt-scrabble", name: "Scrabble" },
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [
          {
            id: "s3",
            playerId: "p1",
            gameId: "g2",
            points: 50,
            scoredAt: new Date("2026-01-15"),
          },
          {
            id: "s4",
            playerId: "p2",
            gameId: "g2",
            points: 90,
            scoredAt: new Date("2026-01-15"),
          },
        ],
      },
      // Tie — neither win nor loss
      {
        id: "g3",
        completed: true,
        createdAt: new Date("2026-01-15"),
        gameType: { id: "gt-scrabble", name: "Scrabble" },
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [
          {
            id: "s5",
            playerId: "p1",
            gameId: "g3",
            points: 75,
            scoredAt: new Date("2026-01-15"),
          },
          {
            id: "s6",
            playerId: "p2",
            gameId: "g3",
            points: 75,
            scoredAt: new Date("2026-01-15"),
          },
        ],
      },
    ]);

    const response = await callLoader("p1");
    const data = await response.json();

    expect(data.gamesPlayed).toBe(3);
    expect(data.wins).toBe(1);
    // 1 win / 3 games = 33%
    expect(data.winRate).toBe(33);
  });

  test("shows per-type stats when no type filter is selected", async () => {
    const { getPlayerGames } = await import("~/models/game.server");
    vi.mocked(getPlayerGames).mockResolvedValueOnce([
      {
        id: "g1",
        completed: true,
        createdAt: new Date("2026-01-15"),
        gameType: { id: "gt-scrabble", name: "Scrabble" },
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [
          {
            id: "s1",
            playerId: "p1",
            gameId: "g1",
            points: 300,
            scoredAt: new Date("2026-01-15"),
          },
          {
            id: "s2",
            playerId: "p2",
            gameId: "g1",
            points: 200,
            scoredAt: new Date("2026-01-15"),
          },
        ],
      },
      {
        id: "g2",
        completed: true,
        createdAt: new Date("2026-01-15"),
        gameType: { id: "gt-sushi", name: "Sushi Go" },
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [
          {
            id: "s3",
            playerId: "p1",
            gameId: "g2",
            points: 40,
            scoredAt: new Date("2026-01-15"),
          },
          {
            id: "s4",
            playerId: "p2",
            gameId: "g2",
            points: 30,
            scoredAt: new Date("2026-01-15"),
          },
        ],
      },
    ]);

    const response = await callLoader("p1");
    const data = await response.json();

    expect(data.perTypeStats).toHaveLength(2);
    const scrabble = data.perTypeStats.find(
      (s: any) => s.gameTypeName === "Scrabble"
    );
    const sushi = data.perTypeStats.find(
      (s: any) => s.gameTypeName === "Sushi Go"
    );
    expect(scrabble!.gamesPlayed).toBe(1);
    expect(scrabble!.highestScore).toBe(300);
    expect(sushi!.gamesPlayed).toBe(1);
    expect(sushi!.highestScore).toBe(40);
  });

  test("filters stats by game type when type param is set", async () => {
    const { getPlayerGames } = await import("~/models/game.server");
    vi.mocked(getPlayerGames).mockResolvedValueOnce([
      {
        id: "g1",
        completed: true,
        createdAt: new Date("2026-01-15"),
        gameType: { id: "gt-scrabble", name: "Scrabble" },
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [
          {
            id: "s1",
            playerId: "p1",
            gameId: "g1",
            points: 300,
            scoredAt: new Date("2026-01-15"),
          },
          {
            id: "s2",
            playerId: "p2",
            gameId: "g1",
            points: 200,
            scoredAt: new Date("2026-01-15"),
          },
        ],
      },
      {
        id: "g2",
        completed: true,
        createdAt: new Date("2026-01-15"),
        gameType: { id: "gt-sushi", name: "Sushi Go" },
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [
          {
            id: "s3",
            playerId: "p1",
            gameId: "g2",
            points: 40,
            scoredAt: new Date("2026-01-15"),
          },
          {
            id: "s4",
            playerId: "p2",
            gameId: "g2",
            points: 30,
            scoredAt: new Date("2026-01-15"),
          },
        ],
      },
    ]);

    const response = await callLoader("p1", { type: "gt-scrabble" });
    const data = await response.json();

    expect(data.gamesPlayed).toBe(1);
    expect(data.averageScore).toBe(300);
    expect(data.highestScore).toBe(300);
    expect(data.perTypeStats).toHaveLength(0); // no per-type when filtered
    expect(data.history).toHaveLength(1);
  });

  test("includes in-progress games in history but not stats", async () => {
    const { getPlayerGames } = await import("~/models/game.server");
    vi.mocked(getPlayerGames).mockResolvedValueOnce([
      {
        id: "g1",
        completed: true,
        createdAt: new Date("2026-01-15"),
        gameType: { id: "gt-scrabble", name: "Scrabble" },
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [
          {
            id: "s1",
            playerId: "p1",
            gameId: "g1",
            points: 100,
            scoredAt: new Date("2026-01-15"),
          },
          {
            id: "s2",
            playerId: "p2",
            gameId: "g1",
            points: 80,
            scoredAt: new Date("2026-01-15"),
          },
        ],
      },
      {
        id: "g2",
        completed: false,
        createdAt: new Date("2026-01-15"),
        gameType: { id: "gt-scrabble", name: "Scrabble" },
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [
          {
            id: "s3",
            playerId: "p1",
            gameId: "g2",
            points: 50,
            scoredAt: new Date("2026-01-15"),
          },
          {
            id: "s4",
            playerId: "p2",
            gameId: "g2",
            points: 30,
            scoredAt: new Date("2026-01-15"),
          },
        ],
      },
    ]);

    const response = await callLoader("p1");
    const data = await response.json();

    expect(data.gamesPlayed).toBe(1); // only completed
    expect(data.history).toHaveLength(2); // both games
    expect(data.history[1].completed).toBe(false);
    expect(data.history[1].place).toBeNull();
  });

  test("skips untyped games in per-type breakdown", async () => {
    const { getPlayerGames } = await import("~/models/game.server");
    vi.mocked(getPlayerGames).mockResolvedValueOnce([
      {
        id: "g1",
        completed: true,
        createdAt: new Date("2026-01-15"),
        gameType: { id: "gt-scrabble", name: "Scrabble" },
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [
          {
            id: "s1",
            playerId: "p1",
            gameId: "g1",
            points: 300,
            scoredAt: new Date("2026-01-15"),
          },
          {
            id: "s2",
            playerId: "p2",
            gameId: "g1",
            points: 200,
            scoredAt: new Date("2026-01-15"),
          },
        ],
      },
      {
        id: "g2",
        completed: true,
        createdAt: new Date("2026-01-15"),
        gameType: null,
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [
          {
            id: "s3",
            playerId: "p1",
            gameId: "g2",
            points: 100,
            scoredAt: new Date("2026-01-15"),
          },
          {
            id: "s4",
            playerId: "p2",
            gameId: "g2",
            points: 80,
            scoredAt: new Date("2026-01-15"),
          },
        ],
      },
    ]);

    const response = await callLoader("p1");
    const data = await response.json();

    // Both count in overall stats
    expect(data.gamesPlayed).toBe(2);
    // Only Scrabble in per-type (untyped skipped)
    expect(data.perTypeStats).toHaveLength(1);
    expect(data.perTypeStats[0].gameTypeName).toBe("Scrabble");
  });

  test("returns available game types from all games", async () => {
    const { getPlayerGames } = await import("~/models/game.server");
    vi.mocked(getPlayerGames).mockResolvedValueOnce([
      {
        id: "g1",
        completed: true,
        createdAt: new Date("2026-01-15"),
        gameType: { id: "gt-scrabble", name: "Scrabble" },
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [],
      },
      {
        id: "g2",
        completed: false,
        createdAt: new Date("2026-01-15"),
        gameType: { id: "gt-sushi", name: "Sushi Go" },
        players: [
          { id: "p1", name: "Alice", userId: "user-1" },
          { id: "p2", name: "Bob", userId: "user-1" },
        ],
        scores: [],
      },
    ]);

    const response = await callLoader("p1");
    const data = await response.json();

    expect(data.availableGameTypes).toEqual([
      { id: "gt-scrabble", name: "Scrabble" },
      { id: "gt-sushi", name: "Sushi Go" },
    ]);
  });
});
