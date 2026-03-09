import { render, screen } from "@testing-library/react";
import {
  Leaderboard,
  getNumberWithOrdinal,
  type LeaderboardPlayer,
} from "./Leaderboard";

describe("getNumberWithOrdinal", () => {
  it("formats ordinals correctly", () => {
    expect(getNumberWithOrdinal(1)).toBe("1st");
    expect(getNumberWithOrdinal(2)).toBe("2nd");
    expect(getNumberWithOrdinal(3)).toBe("3rd");
    expect(getNumberWithOrdinal(4)).toBe("4th");
    expect(getNumberWithOrdinal(11)).toBe("11th");
    expect(getNumberWithOrdinal(21)).toBe("21st");
    expect(getNumberWithOrdinal(22)).toBe("22nd");
    expect(getNumberWithOrdinal(23)).toBe("23rd");
  });
});

describe("Leaderboard", () => {
  it("renders player standings with place, name, and score", () => {
    const players: LeaderboardPlayer[] = [
      { id: "1", name: "Alice", totalScore: 100, place: 1 },
      { id: "2", name: "Bob", totalScore: 80, place: 2 },
      { id: "3", name: "Carol", totalScore: 60, place: 3 },
    ];

    render(<Leaderboard players={players} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText(/1st/)).toBeInTheDocument();
    expect(screen.getByText(/2nd/)).toBeInTheDocument();
    expect(screen.getByText(/3rd/)).toBeInTheDocument();
  });

  it("shows trophy emoji for first place", () => {
    const players: LeaderboardPlayer[] = [
      { id: "1", name: "Alice", totalScore: 100, place: 1 },
      { id: "2", name: "Bob", totalScore: 80, place: 2 },
    ];

    render(<Leaderboard players={players} />);

    expect(screen.getByText(/1st/)).toHaveTextContent("🏆");
    expect(screen.getByText(/2nd/)).not.toHaveTextContent("🏆");
  });

  it("shows trophy emoji for tied first-place players", () => {
    const players: LeaderboardPlayer[] = [
      { id: "1", name: "Alice", totalScore: 100, place: 1 },
      { id: "2", name: "Bob", totalScore: 100, place: 1 },
      { id: "3", name: "Carol", totalScore: 60, place: 3 },
    ];

    render(<Leaderboard players={players} />);

    const firstPlaceElements = screen.getAllByText(/1st/);
    expect(firstPlaceElements).toHaveLength(2);
    firstPlaceElements.forEach((el) => {
      expect(el).toHaveTextContent("🏆");
    });
    expect(screen.getByText(/3rd/)).not.toHaveTextContent("🏆");
  });
});
