import { loader } from "./$gameId";
import { getGame } from "~/models/game.server";

import type { AppData } from "@remix-run/server-runtime";

vi.mock("~/models/game.server", () => {
  return {
    getGame: vi
      .fn()
      .mockResolvedValue({ id: 1, completed: false, players: [], scores: [] }),
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

    expect(data).toEqual({
      game: { id: 1, completed: false, players: [], scores: [] },
    });
  });

  test("calls prisma to get the game", () => {
    expect(getGame).toHaveBeenCalledWith({ id: "1" });
  });
});
