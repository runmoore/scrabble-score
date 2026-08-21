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
    const { container } = render(<InProgressBadge />);
    // The dot is a decorative span — check it exists inside the badge
    const dot = container.querySelector(".bg-amber-500");
    expect(dot).toBeInTheDocument();
  });

  it("renders the dot indicator in count mode", () => {
    const { container } = render(<InProgressBadge count={2} />);
    const dot = container.querySelector(".bg-amber-500");
    expect(dot).toBeInTheDocument();
  });
});
