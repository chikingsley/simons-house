import { describe, expect, it } from "vitest";
import { cn } from "../lib/utils";

describe("Utils", () => {
  describe("cn (class name utility)", () => {
    it("merges class names correctly", () => {
      const result = cn("foo", "bar");
      expect(result).toBe("foo bar");
    });

    it("handles conditional classes", () => {
      const isActive = true;
      const result = cn("base", isActive && "active");
      expect(result).toBe("base active");
    });

    it("handles falsy values", () => {
      const result = cn("base", false, null, undefined);
      expect(result).toBe("base");
    });

    it("merges tailwind classes without conflicts", () => {
      // tailwind-merge should resolve conflicts
      const result = cn("px-2 py-1", "px-4");
      expect(result).toBe("py-1 px-4");
    });

    it("handles arrays of classes", () => {
      const result = cn(["foo", "bar"]);
      expect(result).toBe("foo bar");
    });

    it("handles empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });
  });
});
