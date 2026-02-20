import { loader, action } from "./new";
import type { LoaderData } from "./new";

import { getAllPlayers, createGame } from "~/models/game.server";

vi.mock("~/session.server", () => {
  return {
    requireUserId: vi.fn().mockResolvedValue(123),
  };
});

vi.mock("~/models/game.server", () => {
  return {
    getAllPlayers: vi.fn().mockResolvedValue([{ name: "Eric" }]),
    createGame: vi.fn().mockResolvedValue({ id: "736", players: [1] }),
  };
});

describe("new lodaer function", () => {
  let loaderResponse: any;
  let data: LoaderData;

  beforeEach(async () => {
    loaderResponse = await loader({
      request: new Request("https://url"),
      params: {},
      context: {},
    });

    data = await loaderResponse.json();
  });

  test("makes a request for all players for that user", () => {
    expect(getAllPlayers).toHaveBeenCalledWith({ userId: 123 });
  });

  test("returns all players for that user", () => {
    expect(data.length).toEqual(1);

    expect(data[0].name).toEqual("Eric");
  });
});

describe("start new game function", () => {
  let actionResponse: any;

  beforeEach(async () => {
    const body = new URLSearchParams();

    body.set("action", "start-new-game");
    body.append("players", "1");
    body.append("players", "2");

    actionResponse = await action({
      request: new Request("https://url", {
        method: "POST",
        body,
      }),
      params: {},
      context: {},
    });
  });

  test("starts a new game", () => {
    expect(createGame).toHaveBeenCalledWith({
      userId: 123,
      players: ["1", "2"],
    });
  });

  test("redirects to the play page after", () => {
    expect(actionResponse.status).toEqual(302);
    expect(actionResponse.headers.get("Location")).toEqual("/games/736/play/1");
  });
});
