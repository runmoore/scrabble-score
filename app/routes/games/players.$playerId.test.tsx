import { loader, isOutrightWinner } from "./players.$playerId";

vi.mock("~/session.server", () => ({
  requireUserId: vi.fn().mockResolvedValue("user-1"),
}));

const gameTypeScrabble = { id: "gt-scrabble", name: "Scrabble" };
const gameTypeSushiGo = { id: "gt-sushi", name: "Sushi Go" };

const players = [
  { id: "p1", name: "Alice" },
  { id: "p2", name: "Bob" },
];

function makeGame({
  id,
  completed = true,
  gameType = gameTypeScrabble,
  scores = [],
  createdAt = new Date("2026-01-15").toISOString(),
}: {
  id: string;
  completed?: boolean;
  gameType?: { id: string; name: string } | null;
  scores?: { playerId: string; points: number }[];
  createdAt?: string;
}) {
  return {
    id,
    completed,
    gameType,
    players,
    scores,
    createdAt,
  };
}

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
      makeGame({
        id: "g1",
        scores: [
          { playerId: "p1", points: 100 },
          { playerId: "p2", points: 80 },
        ],
      }),
      // Alice loses
      makeGame({
        id: "g2",
        scores: [
          { playerId: "p1", points: 50 },
          { playerId: "p2", points: 90 },
        ],
      }),
      // Tie — neither win nor loss
      makeGame({
        id: "g3",
        scores: [
          { playerId: "p1", points: 75 },
          { playerId: "p2", points: 75 },
        ],
      }),
    ] as any);

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
      makeGame({
        id: "g1",
        gameType: gameTypeScrabble,
        scores: [
          { playerId: "p1", points: 300 },
          { playerId: "p2", points: 200 },
        ],
      }),
      makeGame({
        id: "g2",
        gameType: gameTypeSushiGo,
        scores: [
          { playerId: "p1", points: 40 },
          { playerId: "p2", points: 30 },
        ],
      }),
    ] as any);

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
      makeGame({
        id: "g1",
        gameType: gameTypeScrabble,
        scores: [
          { playerId: "p1", points: 300 },
          { playerId: "p2", points: 200 },
        ],
      }),
      makeGame({
        id: "g2",
        gameType: gameTypeSushiGo,
        scores: [
          { playerId: "p1", points: 40 },
          { playerId: "p2", points: 30 },
        ],
      }),
    ] as any);

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
      makeGame({
        id: "g1",
        completed: true,
        scores: [
          { playerId: "p1", points: 100 },
          { playerId: "p2", points: 80 },
        ],
      }),
      makeGame({
        id: "g2",
        completed: false,
        scores: [
          { playerId: "p1", points: 50 },
          { playerId: "p2", points: 30 },
        ],
      }),
    ] as any);

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
      makeGame({
        id: "g1",
        gameType: gameTypeScrabble,
        scores: [
          { playerId: "p1", points: 300 },
          { playerId: "p2", points: 200 },
        ],
      }),
      makeGame({
        id: "g2",
        gameType: null,
        scores: [
          { playerId: "p1", points: 100 },
          { playerId: "p2", points: 80 },
        ],
      }),
    ] as any);

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
      makeGame({ id: "g1", gameType: gameTypeScrabble, scores: [] }),
      makeGame({
        id: "g2",
        completed: false,
        gameType: gameTypeSushiGo,
        scores: [],
      }),
    ] as any);

    const response = await callLoader("p1");
    const data = await response.json();

    expect(data.availableGameTypes).toEqual([
      gameTypeScrabble,
      gameTypeSushiGo,
    ]);
  });
});
