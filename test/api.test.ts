import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/convex", () => ({
  convex: {
    query: vi.fn(),
    mutation: vi.fn(),
  },
}));

describe("API", () => {
  describe("getUsers", () => {
    it("should fetch users with pagination parameters", async () => {
      const { api } = await import("../lib/api");
      const { convex } = await import("../lib/convex");

      const mockResponse = {
        users: [{ id: "user-1", name: "Test User" }],
        total: 1,
        hasMore: false,
      };

      (
        convex.query as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(mockResponse);
      const result = await api.getUsers({ limit: 12, offset: 0 });

      expect(convex.query).toHaveBeenCalledWith(expect.anything(), {
        limit: 12,
        offset: 0,
      });
      expect(result.users).toHaveLength(1);
      expect(result.hasMore).toBe(false);
    });

    it("should handle empty options", async () => {
      const { api } = await import("../lib/api");
      const { convex } = await import("../lib/convex");

      const mockResponse = {
        users: [],
        total: 0,
        hasMore: false,
      };

      (
        convex.query as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(mockResponse);
      const result = await api.getUsers();

      expect(result.users).toEqual([]);
    });
  });

  describe("createReference", () => {
    it("should create a reference with correct payload", async () => {
      const mockReference = {
        id: "ref-123",
        authorId: "me",
        authorName: "Test User",
        type: "Host",
        text: "Great experience!",
        isPositive: true,
      };

      const { api } = await import("../lib/api");
      const { convex } = await import("../lib/convex");
      (
        convex.mutation as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(mockReference);
      const result = await api.createReference({
        userId: "user-1",
        authorId: "me",
        type: "Host",
        text: "Great experience!",
        isPositive: true,
      });

      expect(convex.mutation).toHaveBeenCalledWith(expect.anything(), {
        userId: "user-1",
        type: "Host",
        text: "Great experience!",
        isPositive: true,
      });
      expect(result.id).toBe("ref-123");
    });
  });
});
