import { loader } from "./index";

vi.mock("~/session.server", () => ({
  requireUserId: vi.fn().mockResolvedValue("user-1"),
}));

const mockGetLastCompletedGame = vi.fn().mockResolvedValue(null);
const mockGetTopGameTypes = vi.fn().mockResolvedValue([]);
const mockGetTopPlayers = vi.fn().mockResolvedValue([]);

vi.mock("~/models/game.server", () => ({
  getLastCompletedGame: (...args: unknown[]) =>
    mockGetLastCompletedGame(...args),
  getTopGameTypes: (...args: unknown[]) => mockGetTopGameTypes(...args),
  getTopPlayers: (...args: unknown[]) => mockGetTopPlayers(...args),
}));

const callLoader = () =>
  loader({
    request: new Request("http://localhost/games"),
    params: {},
    context: {},
  });

describe("games index loader", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("returns topGameTypes and topPlayers in response", async () => {
    const topGameTypes = [
      { gameTypeId: "gt-1", name: "Scrabble", count: 5 },
      { gameTypeId: "gt-2", name: "Words", count: 3 },
    ];
    const topPlayers = [
      { playerId: "p1", name: "Alice", count: 4 },
      { playerId: "p2", name: "Bob", count: 2 },
    ];

    mockGetTopGameTypes.mockResolvedValueOnce(topGameTypes);
    mockGetTopPlayers.mockResolvedValueOnce(topPlayers);

    const response = await callLoader();
    const data = await response.json();

    expect(data.topGameTypes).toEqual(topGameTypes);
    expect(data.topPlayers).toEqual(topPlayers);
  });

  test("calls all queries in parallel with correct params", async () => {
    await callLoader();

    expect(mockGetLastCompletedGame).toHaveBeenCalledWith({
      userId: "user-1",
    });
    expect(mockGetTopGameTypes).toHaveBeenCalledWith({
      userId: "user-1",
      limit: 3,
    });
    expect(mockGetTopPlayers).toHaveBeenCalledWith({
      userId: "user-1",
      limit: 3,
    });
  });

  test("returns empty arrays when no stats data exists", async () => {
    const response = await callLoader();
    const data = await response.json();

    expect(data.topGameTypes).toEqual([]);
    expect(data.topPlayers).toEqual([]);
    expect(data.lastCompletedGame).toBeNull();
  });
});
