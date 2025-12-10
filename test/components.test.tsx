import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "../components/ui/skeleton";
import { StatusBadge } from "../components/ui/status-badge";

describe("UI Components", () => {
  describe("Skeleton", () => {
    it("renders with default classes", () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toHaveClass("animate-pulse");
      expect(skeleton).toHaveClass("rounded-md");
    });

    it("accepts custom className", () => {
      render(<Skeleton className="h-10 w-full" data-testid="skeleton" />);
      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toHaveClass("h-10");
      expect(skeleton).toHaveClass("w-full");
    });
  });

  describe("StatusBadge", () => {
    it("renders accepting guests status correctly", () => {
      render(<StatusBadge status="accepting_guests" />);
      expect(screen.getByText("Accepting Guests")).toBeInTheDocument();
    });

    it("renders not accepting guests status correctly", () => {
      render(<StatusBadge status="not_accepting_guests" />);
      expect(screen.getByText("Not Accepting")).toBeInTheDocument();
    });

    it("renders maybe accepting guests status correctly", () => {
      render(<StatusBadge status="maybe_accepting_guests" />);
      expect(screen.getByText("Maybe Accepting")).toBeInTheDocument();
    });

    it("renders wants to meet up status correctly", () => {
      render(<StatusBadge status="wants_to_meet_up" />);
      expect(screen.getByText("Wants to Meet Up")).toBeInTheDocument();
    });

    it("applies size classes correctly", () => {
      const { container } = render(
        <StatusBadge size="lg" status="accepting_guests" />
      );
      expect(container.firstChild).toHaveClass("px-4");
      expect(container.firstChild).toHaveClass("py-2");
    });
  });
});
