import { loader } from "./compare.$playerOne.$playerTwo";

vi.mock("~/session.server", () => {
  return {
    requireUserId: vi.fn().mockResolvedValue("user1"),
  };
});

vi.mock("~/models/game.server", () => {
  const gameTypeA = { id: "type-a", name: "Standard" };
  const gameTypeB = { id: "type-b", name: "Super" };
  const players = [
    { id: "p1", name: "Alice" },
    { id: "p2", name: "Bob" },
  ];

  return {
    getPlayer: vi.fn().mockImplementation(({ id }: { id: string }) => {
      if (id === "p1") return { name: "Alice" };
      if (id === "p2") return { name: "Bob" };
      return null;
    }),
    getAllGames: vi.fn().mockResolvedValue([
      {
        id: "g1",
        createdAt: new Date().toISOString(),
        completed: false,
        gameType: gameTypeA,
        players,
        scores: [
          { playerId: "p1", points: 100 },
          { playerId: "p2", points: 80 },
        ],
      },
      {
        id: "g2",
        createdAt: new Date().toISOString(),
        completed: false,
        gameType: gameTypeB,
        players,
        scores: [
          { playerId: "p1", points: 90 },
          { playerId: "p2", points: 110 },
        ],
      },
      {
        id: "g3",
        createdAt: new Date().toISOString(),
        completed: false,
        gameType: gameTypeA,
        players,
        scores: [
          { playerId: "p1", points: 120 },
          { playerId: "p2", points: 95 },
        ],
      },
      {
        id: "g4",
        createdAt: new Date().toISOString(),
        completed: false,
        gameType: null,
        players,
        scores: [
          { playerId: "p1", points: 70 },
          { playerId: "p2", points: 85 },
        ],
      },
    ]),
  };
});

const callLoader = (url: string) =>
  loader({
    request: new Request(url),
    params: { playerOne: "p1", playerTwo: "p2" },
    context: {},
  });

describe("compare loader", () => {
  describe("filtering by game type", () => {
    test("no type params returns all games", async () => {
      const response = await callLoader("http://localhost/games/compare/p1/p2");
      const data = await response.json();

      expect(data.relevantGames).toHaveLength(4);
    });

    test("single type param filters to matching games", async () => {
      const response = await callLoader(
        "http://localhost/games/compare/p1/p2?type=type-a"
      );
      const data = await response.json();

      expect(data.relevantGames).toHaveLength(2);
      expect(
        data.relevantGames.every((g: any) => g.gameType?.id === "type-a")
      ).toBe(true);
    });

    test("untyped games are excluded when type filter is active", async () => {
      const response = await callLoader(
        "http://localhost/games/compare/p1/p2?type=type-a"
      );
      const data = await response.json();

      expect(data.relevantGames.some((g: any) => g.gameType === null)).toBe(
        false
      );
    });

    test("stats are computed from filtered games only", async () => {
      // type-a games: g1 (Alice 100, Bob 80) and g3 (Alice 120, Bob 95) — Alice wins both
      const response = await callLoader(
        "http://localhost/games/compare/p1/p2?type=type-a"
      );
      const data = await response.json();

      expect(data.playerOne.won).toBe(2);
      expect(data.playerTwo.won).toBe(0);
      expect(data.highestScore.score).toBe(120);
    });
  });

  describe("availableGameTypes", () => {
    test("returns distinct game types from unfiltered games sorted alphabetically", async () => {
      const response = await callLoader("http://localhost/games/compare/p1/p2");
      const data = await response.json();

      expect(data.availableGameTypes).toEqual([
        { id: "type-a", name: "Standard" },
        { id: "type-b", name: "Super" },
      ]);
    });

    test("available types are unaffected by active filter", async () => {
      const response = await callLoader(
        "http://localhost/games/compare/p1/p2?type=type-a"
      );
      const data = await response.json();

      expect(data.availableGameTypes).toHaveLength(2);
    });
  });
});
