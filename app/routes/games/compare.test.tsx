import { render, screen } from "@testing-library/react";
import { useLoaderData } from "@remix-run/react";

import ComparePage, { loader } from "./compare";

const p1 = { id: "p1", name: "Alice" };
const p2 = { id: "p2", name: "Bob" };
const p3 = { id: "p3", name: "Carol" };
const p4 = { id: "p4", name: "Dave" };
const p5 = { id: "p5", name: "Eve" };

vi.mock("~/session.server", () => ({
  requireUserId: vi.fn().mockResolvedValue("user1"),
}));

const mockGetAllPlayers = vi.fn().mockResolvedValue([p1, p2, p3, p4, p5]);

const mockGetAllGames = vi.fn().mockResolvedValue([]);

vi.mock("~/models/game.server", () => ({
  getAllPlayers: (...args: unknown[]) => mockGetAllPlayers(...args),
  getAllGames: (...args: unknown[]) => mockGetAllGames(...args),
}));

vi.mock("@remix-run/react", () => ({
  Form: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <form {...props}>{children}</form>
  ),
  useLoaderData: vi.fn(),
}));

const callLoader = () =>
  loader({
    request: new Request("http://localhost/games/compare"),
    params: {},
    context: {},
  });

function makeGame(
  id: string,
  players: Array<{ id: string; name: string }>,
  opts: {
    completed?: boolean;
    gameType?: { id: string; name: string } | null;
  } = {}
) {
  return {
    id,
    createdAt: new Date().toISOString(),
    completed: opts.completed ?? true,
    gameType: opts.gameType ?? null,
    players,
    scores: [],
  };
}

describe("compare loader – matchup aggregation", () => {
  test("returns matchups for multiple pairs ordered by game count", async () => {
    mockGetAllGames.mockResolvedValueOnce([
      makeGame("g1", [p1, p2]),
      makeGame("g2", [p1, p2]),
      makeGame("g3", [p1, p2]),
      makeGame("g4", [p3, p4]),
      makeGame("g5", [p3, p4]),
    ]);

    const data = await (await callLoader()).json();

    expect(data.matchups).toHaveLength(2);
    expect(data.matchups[0].gameCount).toBe(3);
    expect(data.matchups[1].gameCount).toBe(2);
  });

  test("limits to top 3 pairs", async () => {
    mockGetAllGames.mockResolvedValueOnce([
      makeGame("g1", [p1, p2]),
      makeGame("g2", [p1, p2]),
      makeGame("g3", [p1, p2]),
      makeGame("g4", [p1, p2]),
      makeGame("g5", [p3, p4]),
      makeGame("g6", [p3, p4]),
      makeGame("g7", [p3, p4]),
      makeGame("g8", [p1, p3]),
      makeGame("g9", [p1, p3]),
      makeGame("g10", [p2, p4]),
    ]);

    const data = await (await callLoader()).json();

    expect(data.matchups).toHaveLength(3);
    expect(data.matchups[0].gameCount).toBe(4);
    expect(data.matchups[1].gameCount).toBe(3);
    expect(data.matchups[2].gameCount).toBe(2);
  });

  test("only counts completed games", async () => {
    mockGetAllGames.mockResolvedValueOnce([
      makeGame("g1", [p1, p2], { completed: true }),
      makeGame("g2", [p1, p2], { completed: false }),
      makeGame("g3", [p1, p2], { completed: false }),
    ]);

    const data = await (await callLoader()).json();

    expect(data.matchups).toHaveLength(1);
    expect(data.matchups[0].gameCount).toBe(1);
  });

  test("only counts 2-player games", async () => {
    mockGetAllGames.mockResolvedValueOnce([
      makeGame("g1", [p1, p2]),
      makeGame("g2", [p1, p2, p3]),
      makeGame("g3", [p1]),
    ]);

    const data = await (await callLoader()).json();

    expect(data.matchups).toHaveLength(1);
    expect(data.matchups[0].gameCount).toBe(1);
  });

  test("collects game types sorted alphabetically", async () => {
    mockGetAllGames.mockResolvedValueOnce([
      makeGame("g1", [p1, p2], {
        gameType: { id: "t2", name: "Words With Friends" },
      }),
      makeGame("g2", [p1, p2], {
        gameType: { id: "t1", name: "Scrabble" },
      }),
      makeGame("g3", [p1, p2], {
        gameType: { id: "t2", name: "Words With Friends" },
      }),
    ]);

    const data = await (await callLoader()).json();

    expect(data.matchups[0].gameTypes).toEqual([
      "Scrabble",
      "Words With Friends",
    ]);
  });

  test("omits gameTypes when no games have a type", async () => {
    mockGetAllGames.mockResolvedValueOnce([
      makeGame("g1", [p1, p2], { gameType: null }),
      makeGame("g2", [p1, p2], { gameType: null }),
    ]);

    const data = await (await callLoader()).json();

    expect(data.matchups[0].gameTypes).toEqual([]);
  });

  test("returns empty matchups when no 2-player completed games exist", async () => {
    mockGetAllGames.mockResolvedValueOnce([]);

    const data = await (await callLoader()).json();

    expect(data.matchups).toEqual([]);
  });

  test("canonical pair key treats A-vs-B same as B-vs-A", async () => {
    mockGetAllGames.mockResolvedValueOnce([
      makeGame("g1", [p2, p1]),
      makeGame("g2", [p1, p2]),
    ]);

    const data = await (await callLoader()).json();

    expect(data.matchups).toHaveLength(1);
    expect(data.matchups[0].gameCount).toBe(2);
  });
});

describe("ComparePage component", () => {
  function renderPage(matchups: any[] = []) {
    vi.mocked(useLoaderData).mockReturnValue({
      players: [p1, p2, p3],
      matchups,
    });

    return render(<ComparePage />);
  }

  test("renders matchup cards when matchups exist", () => {
    renderPage([
      {
        playerOne: p1,
        playerTwo: p2,
        gameCount: 5,
        gameTypes: ["Scrabble"],
      },
    ]);

    expect(screen.getByText("Alice vs Bob")).toBeInTheDocument();
  });

  test("does not render cards section when no matchups", () => {
    renderPage([]);

    expect(screen.queryByText(/vs/)).not.toBeInTheDocument();
  });

  test("displays correct game count with plural", () => {
    renderPage([
      {
        playerOne: p1,
        playerTwo: p2,
        gameCount: 5,
        gameTypes: [],
      },
    ]);

    expect(screen.getByText("5 games")).toBeInTheDocument();
  });

  test("displays singular '1 game'", () => {
    renderPage([
      {
        playerOne: p1,
        playerTwo: p2,
        gameCount: 1,
        gameTypes: [],
      },
    ]);

    expect(screen.getByText("1 game")).toBeInTheDocument();
  });

  test("displays game types as comma-separated text", () => {
    renderPage([
      {
        playerOne: p1,
        playerTwo: p2,
        gameCount: 3,
        gameTypes: ["Scrabble", "Words With Friends"],
      },
    ]);

    expect(
      screen.getByText("Scrabble, Words With Friends")
    ).toBeInTheDocument();
  });

  test("omits game types line when empty", () => {
    renderPage([
      {
        playerOne: p1,
        playerTwo: p2,
        gameCount: 2,
        gameTypes: [],
      },
    ]);

    expect(screen.getByText("2 games")).toBeInTheDocument();
    const card = screen.getByText("Alice vs Bob").closest("a");
    const paragraphs = card?.querySelectorAll("p");
    expect(paragraphs).toHaveLength(1);
  });

  test("card links to correct comparison URL", () => {
    renderPage([
      {
        playerOne: p1,
        playerTwo: p2,
        gameCount: 3,
        gameTypes: [],
      },
    ]);

    const link = screen.getByText("Alice vs Bob").closest("a");
    expect(link).toHaveAttribute("href", "/games/compare/p1/p2");
  });
});
