import { loader, action } from "./new";
import type { LoaderData } from "./new";

import {
  getAllPlayers,
  getAllGameTypes,
  createGame,
  addPlayer,
  addGameType,
} from "~/models/game.server";

vi.mock("~/session.server", () => {
  return {
    requireUserId: vi.fn().mockResolvedValue(123),
  };
});

vi.mock("~/models/game.server", () => {
  return {
    getAllPlayers: vi.fn().mockResolvedValue([{ name: "Eric" }]),
    getAllGameTypes: vi
      .fn()
      .mockResolvedValue([{ id: "gt1", name: "Scrabble" }]),
    createGame: vi.fn().mockResolvedValue({ id: "736", players: [1] }),
    addPlayer: vi.fn().mockResolvedValue({ id: "p1", name: "Alice" }),
    addGameType: vi.fn().mockResolvedValue({ id: "gt2", name: "Words" }),
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

  test("makes a request for all game types for that user", () => {
    expect(getAllGameTypes).toHaveBeenCalledWith({ userId: 123 });
  });

  test("returns all players for that user", () => {
    expect(data.players.length).toEqual(1);
    expect(data.players[0].name).toEqual("Eric");
  });

  test("returns all game types for that user", () => {
    expect(data.gameTypes.length).toEqual(1);
    expect(data.gameTypes[0].name).toEqual("Scrabble");
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
      gameTypeId: null,
    });
  });

  test("redirects to the play page after", () => {
    expect(actionResponse.status).toEqual(302);
    expect(actionResponse.headers.get("Location")).toEqual("/games/736/play/1");
  });
});

function makeRequest(params: Record<string, string>) {
  const body = new URLSearchParams(params);
  return new Request("https://url", { method: "POST", body });
}

describe("start-new-game validation", () => {
  beforeEach(() => {
    vi.mocked(createGame).mockClear();
  });

  test("returns 400 JSON error when fewer than 2 players submitted", async () => {
    const body = new URLSearchParams();
    body.set("action", "start-new-game");
    body.append("players", "1");

    const response = await action({
      request: new Request("https://url", { method: "POST", body }),
      params: {},
      context: {},
    });

    expect(response.status).toEqual(400);
    const data = await response.json();
    expect(data.errors).toBe("You must select at least 2 players to play");
    expect(createGame).not.toHaveBeenCalled();
  });

  test("returns 400 JSON error when no players submitted", async () => {
    const body = new URLSearchParams();
    body.set("action", "start-new-game");

    const response = await action({
      request: new Request("https://url", { method: "POST", body }),
      params: {},
      context: {},
    });

    expect(response.status).toEqual(400);
    const data = await response.json();
    expect(data.errors).toBe("You must select at least 2 players to play");
  });
});

describe("add-player action", () => {
  beforeEach(() => {
    vi.mocked(addPlayer).mockClear();
  });

  test("returns error for empty name", async () => {
    const response = await action({
      request: makeRequest({ action: "add-player", name: "" }),
      params: {},
      context: {},
    });
    const data = await response.json();
    expect(data.errors).toBe("empty name");
    expect(addPlayer).not.toHaveBeenCalled();
  });

  test("returns error for whitespace-only name", async () => {
    const response = await action({
      request: makeRequest({ action: "add-player", name: "   " }),
      params: {},
      context: {},
    });
    const data = await response.json();
    expect(data.errors).toBe("empty name");
    expect(addPlayer).not.toHaveBeenCalled();
  });

  test("trims whitespace from valid name", async () => {
    await action({
      request: makeRequest({ action: "add-player", name: "  Alice  " }),
      params: {},
      context: {},
    });
    expect(addPlayer).toHaveBeenCalledWith({ userId: 123, name: "Alice" });
  });

  test("returns error for duplicate name", async () => {
    const response = await action({
      request: makeRequest({ action: "add-player", name: "Eric" }),
      params: {},
      context: {},
    });
    const data = await response.json();
    expect(data.errors).toBe("player name already exists");
    expect(addPlayer).not.toHaveBeenCalled();
  });

  test("returns error for duplicate name with different casing", async () => {
    const response = await action({
      request: makeRequest({ action: "add-player", name: "eric" }),
      params: {},
      context: {},
    });
    const data = await response.json();
    expect(data.errors).toBe("player name already exists");
    expect(addPlayer).not.toHaveBeenCalled();
  });

  test("returns empty errors on success", async () => {
    const response = await action({
      request: makeRequest({ action: "add-player", name: "Bob" }),
      params: {},
      context: {},
    });
    const data = await response.json();
    expect(data.errors).toBe("");
  });
});

describe("add-game-type action", () => {
  beforeEach(() => {
    vi.mocked(addGameType).mockClear();
  });

  test("returns error for empty name", async () => {
    const response = await action({
      request: makeRequest({ action: "add-game-type", gameTypeName: "" }),
      params: {},
      context: {},
    });
    const data = await response.json();
    expect(data.errors).toBe("empty game type name");
    expect(addGameType).not.toHaveBeenCalled();
  });

  test("returns error for whitespace-only name", async () => {
    const response = await action({
      request: makeRequest({ action: "add-game-type", gameTypeName: "   " }),
      params: {},
      context: {},
    });
    const data = await response.json();
    expect(data.errors).toBe("empty game type name");
    expect(addGameType).not.toHaveBeenCalled();
  });

  test("trims whitespace from valid name", async () => {
    await action({
      request: makeRequest({
        action: "add-game-type",
        gameTypeName: "  Words  ",
      }),
      params: {},
      context: {},
    });
    expect(addGameType).toHaveBeenCalledWith({ userId: 123, name: "Words" });
  });

  test("returns error for duplicate name", async () => {
    const response = await action({
      request: makeRequest({
        action: "add-game-type",
        gameTypeName: "Scrabble",
      }),
      params: {},
      context: {},
    });
    const data = await response.json();
    expect(data.errors).toBe("game type name already exists");
    expect(addGameType).not.toHaveBeenCalled();
  });

  test("returns error for duplicate name with different casing", async () => {
    const response = await action({
      request: makeRequest({
        action: "add-game-type",
        gameTypeName: "scrabble",
      }),
      params: {},
      context: {},
    });
    const data = await response.json();
    expect(data.errors).toBe("game type name already exists");
    expect(addGameType).not.toHaveBeenCalled();
  });

  test("returns empty errors on success", async () => {
    const response = await action({
      request: makeRequest({ action: "add-game-type", gameTypeName: "Words" }),
      params: {},
      context: {},
    });
    const data = await response.json();
    expect(data.errors).toBe("");
  });
});
