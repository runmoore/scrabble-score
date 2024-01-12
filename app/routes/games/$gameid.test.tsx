import { loader, action } from "./$gameId";
import { getGame, reopenGame, createGame } from "~/models/game.server";

import { redirect } from "@remix-run/server-runtime";

vi.mock("~/session.server", () => {
  return {
    requireUserId: vi.fn().mockResolvedValue("xxx"),
  };
});
vi.mock("~/models/game.server", () => {
  return {
    reopenGame: vi.fn(),
    getGame: vi.fn().mockResolvedValue({
      id: 1,
      completed: false,
      players: [
        { id: 1, name: "alice", totalScore: 5 },
        { id: 2, name: "nina", totalScore: 2 },
      ],
      scores: [],
    }),
    createGame: vi.fn().mockResolvedValue({
      id: "567",
    }),
  };
});
describe("loader function", () => {
  let loaderResponse: any;

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
        { id: 1, name: "alice", totalScore: 5, place: 1 },
        { id: 2, name: "nina", totalScore: 2, place: 2 },
      ],
      scores: [],
    });
  });

  test("returns the 1 winner", async () => {
    const data = await loaderResponse.json();

    expect(data.winners.length).toEqual(1);
    expect(data.winners).toEqual([
      { id: 1, name: "alice", totalScore: 5, place: 1 },
    ]);
  });

  test("returns the top score", async () => {
    const data = await loaderResponse.json();

    expect(data.topScore).toEqual(5);
  });

  test("calls prisma to get the game", () => {
    expect(getGame).toHaveBeenCalledWith({ id: "1" });
  });
});

describe("action function for reopen game", () => {
  let actionResponse: any;

  beforeEach(async () => {
    const formData = new FormData();
    formData.append("action", "reopen");

    actionResponse = await action({
      request: new Request("https://url", {
        method: "POST",
        body: formData,
      }),
      params: { gameId: "123" },
      context: {},
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("returns a redirect response", () => {
    expect(actionResponse).toEqual(redirect("/games/123/play/1"));
  });

  test("should reopen the game", () => {
    expect(reopenGame).toHaveBeenCalledWith("123");
  });
});

describe("action function for rematch game", () => {
  let actionResponse: any;

  beforeEach(async () => {
    const formData = new FormData();
    formData.append("action", "rematch");

    actionResponse = await action({
      request: new Request("https://url", {
        method: "POST",
        body: formData,
      }),
      params: { gameId: "123" },
      context: {},
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("returns a redirect response", () => {
    expect(actionResponse).toEqual(redirect("/games/567/play/1"));
  });

  test("should create a new game", () => {
    expect(createGame).toHaveBeenCalledWith({
      userId: "xxx",
      players: [1, 2],
    });
  });
});
