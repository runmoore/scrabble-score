import {
  getNextPlayerToPlay,
  enrichPlayerScores,
  assignPlaces,
} from "./game-utils";
import type { Player, Score } from "./models/game.server";
import type { PlayerWithScores } from "./game-utils";

const makePlayer = (id: string, name: string): Player => ({
  id,
  name,
  userId: "user1",
});

const makeScore = (playerId: string, points: number): Score => ({
  id: `score-${playerId}-${points}`,
  playerId,
  points,
  gameId: "game1",
  scoredAt: new Date(),
});

const makePlayerWithScores = (
  id: string,
  name: string,
  totalScore: number
): PlayerWithScores => ({
  ...makePlayer(id, name),
  scores: [],
  totalScore,
});

describe("enrichPlayerScores", () => {
  it("computes totalScore for each player from their scores", () => {
    const players = [makePlayer("1", "Alice"), makePlayer("2", "Bob")];
    const scores = [
      makeScore("1", 10),
      makeScore("2", 20),
      makeScore("1", 30),
      makeScore("2", 5),
    ];

    const result = enrichPlayerScores(players, scores);

    expect(result[0].totalScore).toBe(40);
    expect(result[1].totalScore).toBe(25);
  });

  it("attaches only the relevant scores to each player", () => {
    const players = [makePlayer("1", "Alice"), makePlayer("2", "Bob")];
    const scores = [makeScore("1", 10), makeScore("2", 20)];

    const result = enrichPlayerScores(players, scores);

    expect(result[0].scores).toHaveLength(1);
    expect(result[0].scores[0].points).toBe(10);
    expect(result[1].scores).toHaveLength(1);
    expect(result[1].scores[0].points).toBe(20);
  });

  it("returns totalScore 0 for a player with no scores", () => {
    const players = [makePlayer("1", "Alice")];
    const result = enrichPlayerScores(players, []);

    expect(result[0].totalScore).toBe(0);
    expect(result[0].scores).toHaveLength(0);
  });
});

describe("assignPlaces", () => {
  it("sorts players by totalScore descending and assigns places", () => {
    const players = [
      makePlayerWithScores("1", "Alice", 30),
      makePlayerWithScores("2", "Bob", 50),
      makePlayerWithScores("3", "Carol", 10),
    ];

    const result = assignPlaces(players);

    expect(result[0]).toMatchObject({ name: "Bob", place: 1 });
    expect(result[1]).toMatchObject({ name: "Alice", place: 2 });
    expect(result[2]).toMatchObject({ name: "Carol", place: 3 });
  });

  it("assigns the same place to tied players", () => {
    const players = [
      makePlayerWithScores("1", "Alice", 40),
      makePlayerWithScores("2", "Bob", 40),
      makePlayerWithScores("3", "Carol", 10),
    ];

    const result = assignPlaces(players);

    expect(result[0].place).toBe(1);
    expect(result[1].place).toBe(1);
    expect(result[2].place).toBe(3);
  });

  it("handles a single player", () => {
    const players = [makePlayerWithScores("1", "Alice", 100)];

    const result = assignPlaces(players);

    expect(result).toHaveLength(1);
    expect(result[0].place).toBe(1);
  });

  it("handles all players tied", () => {
    const players = [
      makePlayerWithScores("1", "Alice", 25),
      makePlayerWithScores("2", "Bob", 25),
    ];

    const result = assignPlaces(players);

    expect(result[0].place).toBe(1);
    expect(result[1].place).toBe(1);
  });
});

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
