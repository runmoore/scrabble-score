import { loader } from "./$gameId.play.$playerId";
import { dataOf } from "../../../test/loader-result";

vi.mock("~/session.server", () => {
  return {
    requireUserId: vi.fn().mockResolvedValue("xxx"),
  };
});
vi.mock("~/models/game.server", () => {
  return {
    getAllGameTypes: vi.fn().mockResolvedValue([]),
    getGame: vi.fn().mockResolvedValue({
      id: 1,
      completed: false,
      gameType: null,
      players: [
        { id: 1, totalScore: 11 },
        { id: 2, totalScore: 22 },
      ],
      scores: [
        { playerId: 1, points: 1 },
        { playerId: 2, points: 2 },
        { playerId: 1, points: 10 },
        { playerId: 2, points: 20 },
      ],
    }),
  };
});

describe("play loader function", () => {
  let loaderResponse: any;
  let data: any;

  beforeEach(async () => {
    loaderResponse = await loader({
      request: new Request("https://url"),
      params: { gameId: "123", playerId: "987" },
      context: {},
    });

    data = dataOf(loaderResponse);
  });

  test("returns the game Id", async () => {
    expect(data.game.id).toEqual(1);
  });

  test("returns the top score of all players", async () => {
    expect(data.topScore).toEqual(22);
  });
});
