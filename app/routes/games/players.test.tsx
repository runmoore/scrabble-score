import { loader } from "./players";

vi.mock("~/session.server", () => ({
  requireUserId: vi.fn().mockResolvedValue("user-1"),
}));

vi.mock("~/models/game.server", () => ({
  getAllPlayersWithGameCount: vi.fn().mockResolvedValue([
    { playerId: "p1", name: "Alice", count: 5 },
    { playerId: "p2", name: "Bob", count: 3 },
  ]),
}));

describe("players loader", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("returns all players sorted by game count", async () => {
    const { getAllPlayersWithGameCount } = await import("~/models/game.server");

    const response = await loader({
      request: new Request("http://localhost/games/players"),
      params: {},
      context: {},
    });

    const data = await response.json();

    expect(getAllPlayersWithGameCount).toHaveBeenCalledWith({
      userId: "user-1",
    });
    expect(data.players).toEqual([
      { playerId: "p1", name: "Alice", count: 5 },
      { playerId: "p2", name: "Bob", count: 3 },
    ]);
  });

  test("returns empty array when no players exist", async () => {
    const { getAllPlayersWithGameCount } = await import("~/models/game.server");
    vi.mocked(getAllPlayersWithGameCount).mockResolvedValueOnce([]);

    const response = await loader({
      request: new Request("http://localhost/games/players"),
      params: {},
      context: {},
    });

    const data = await response.json();
    expect(data.players).toEqual([]);
  });
});
