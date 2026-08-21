import { render, screen } from "@testing-library/react";
import { InProgressBadge } from "./InProgressBadge";

describe("InProgressBadge", () => {
  it("renders 'In Progress' text in standalone mode", () => {
    render(<InProgressBadge />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders a count variant with the count", () => {
    render(<InProgressBadge count={3} />);
    expect(screen.getByText("3 in progress")).toBeInTheDocument();
  });

  it("renders the dot indicator in standalone mode", () => {
    render(<InProgressBadge />);
    expect(screen.getByTestId("in-progress-dot")).toBeInTheDocument();
  });

  it("renders the dot indicator in count mode", () => {
    render(<InProgressBadge count={2} />);
    expect(screen.getByTestId("in-progress-dot")).toBeInTheDocument();
  });
});
