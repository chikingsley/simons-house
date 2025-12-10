import { describe, expect, it, vi } from "vitest";

// Mock fetch for API tests
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("API", () => {
  describe("getUsers", () => {
    it("should fetch users with pagination parameters", async () => {
      const mockResponse = {
        users: [{ id: "user-1", name: "Test User" }],
        total: 1,
        hasMore: false,
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const { api } = await import("../lib/api");
      const result = await api.getUsers({ limit: 12, offset: 0 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/users?")
      );
      expect(result.users).toHaveLength(1);
      expect(result.hasMore).toBe(false);
    });

    it("should handle empty options", async () => {
      const mockResponse = {
        users: [],
        total: 0,
        hasMore: false,
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const { api } = await import("../lib/api");
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

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockReference),
      });

      const { api } = await import("../lib/api");
      const result = await api.createReference({
        userId: "user-1",
        authorId: "me",
        type: "Host",
        text: "Great experience!",
        isPositive: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/references"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
      expect(result.id).toBe("ref-123");
    });
  });
});
