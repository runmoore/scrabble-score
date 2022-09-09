import { getNextPlayerToPlay } from "./game-utils";

describe("getNextPlayerToPlay", () => {
  it("when no scores, pick first player", () => {
    const game = {
      scores: [],
      players: [
        { id: "1", name: "queen", userId: "user1" },
        { id: "2", name: "king", userId: "user2" },
      ],
    };
    const nextPlayer = getNextPlayerToPlay(game);

    expect(nextPlayer.id).toEqual("1");
  });

  it("when one player has scored, pick second player", () => {
    const game = {
      scores: [
        {
          playerId: "1",
          id: "x",
          gameId: "y",
          scoredAt: new Date(),
          points: 100,
        },
      ],
      players: [
        { id: "1", name: "queen", userId: "user1" },
        { id: "2", name: "king", userId: "user2" },
      ],
    };
    const nextPlayer = getNextPlayerToPlay(game);

    expect(nextPlayer.id).toEqual("2");
  });

  it("when two players have scored, pick first player again", () => {
    const game = {
      scores: [
        {
          playerId: "1",
          id: "x",
          gameId: "y",
          scoredAt: new Date(),
          points: 100,
        },
        {
          playerId: "2",
          id: "x",
          gameId: "y",
          scoredAt: new Date(),
          points: 200,
        },
      ],
      players: [
        { id: "1", name: "queen", userId: "user1" },
        { id: "2", name: "king", userId: "user2" },
      ],
    };
    const nextPlayer = getNextPlayerToPlay(game);

    expect(nextPlayer.id).toEqual("1");
  });

  it("when two players have scored, and three players are playing, pick third player", () => {
    const game = {
      scores: [
        {
          playerId: "1",
          id: "x",
          gameId: "y",
          scoredAt: new Date(),
          points: 100,
        },
        {
          playerId: "2",
          id: "x",
          gameId: "y",
          scoredAt: new Date(),
          points: 200,
        },
      ],
      players: [
        { id: "1", name: "queen", userId: "user1" },
        { id: "2", name: "king", userId: "user2" },
        { id: "3", name: "prince", userId: "user3" },
      ],
    };
    const nextPlayer = getNextPlayerToPlay(game);

    expect(nextPlayer.id).toEqual("3");
  });
});
