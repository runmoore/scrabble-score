import { loader } from "./$gameId";
import { getGame } from "~/models/game.server";

import type { AppData } from "@remix-run/server-runtime";

vi.mock("~/session.server");
vi.mock("~/models/game.server", () => {
  return {
    getGame: vi.fn().mockResolvedValue({
      id: 1,
      completed: false,
      players: [
        { name: "alice", totalScore: 5 },
        { name: "nina", totalScore: 2 },
      ],
      scores: [],
    }),
  };
});
describe("loader function", () => {
  let loaderResponse: AppData;

  beforeEach(async () => {
    loaderResponse = await loader({
      request: new Request("https://url"),
      params: { gameId: "1" },
      context: {},
    });
  });

  test("returns a response", () => {
    expect(loaderResponse).toBeInstanceOf(Response);
  });

  test("returns a 200 response", () => {
    expect(loaderResponse.status).toEqual(200);
  });

  test("returns the returned game", async () => {
    const data = await loaderResponse.json();

    expect(data.game).toEqual({
      id: 1,
      completed: false,
      players: [
        { name: "alice", totalScore: 5, place: 1 },
        { name: "nina", totalScore: 2, place: 2 },
      ],
      scores: [],
    });
  });

  test("returns the 1 winner", async () => {
    const data = await loaderResponse.json();

    expect(data.winners.length).toEqual(1);
    expect(data.winners).toEqual([{ name: "alice", totalScore: 5, place: 1 }]);
  });

  test("returns the top score", async () => {
    const data = await loaderResponse.json();

    expect(data.topScore).toEqual(5);
  });

  test("calls prisma to get the game", () => {
    expect(getGame).toHaveBeenCalledWith({ id: "1" });
  });
});
