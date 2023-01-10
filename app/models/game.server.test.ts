import { getGame } from "./game.server";
import { prisma } from "~/db.server";

import type { EnhancedGame } from "./game.server";

vi.mock("~/db.server", () => {
  return {
    prisma: {
      game: {
        findFirst: vi.fn().mockResolvedValue({
          id: "123",
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
      },
    },
  };
});

describe("game.server getGame", () => {
  let result: EnhancedGame;

  beforeEach(async () => {
    result = (await getGame({ id: "123" })) as EnhancedGame;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("calls prisma findFirst", () => {
    expect(prisma.game.findFirst).toHaveBeenCalledWith({
      where: { id: "123" },
      select: {
        id: true,
        completed: true,
        players: true,
        scores: true,
      },
    });
  });

  test("returns the total score for each player", async () => {
    expect(result.players[0].totalScore).toEqual(11);
    expect(result.players[1].totalScore).toEqual(22);
  });
});
