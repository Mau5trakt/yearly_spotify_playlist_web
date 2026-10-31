import { describe, expect, it } from "bun:test";
import { CreatePlaylistSchema } from "../lib/spotify";

describe("CreatePlaylistSchema", () => {
  it("validates valid input with numeric year", () => {
    const input = {
      year: 2024,
      trackUris: ["spotify:track:123", "spotify:track:456"],
      isPublic: true,
    };

    const result = CreatePlaylistSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe("2024");
      expect(result.data.trackUris.length).toBe(2);
      expect(result.data.isPublic).toBe(true);
    }
  });

  it("validates valid input with string year", () => {
    const input = {
      year: "2023",
      trackUris: ["spotify:track:abc"],
    };

    const result = CreatePlaylistSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe("2023");
      expect(result.data.isPublic).toBe(true); // default true
    }
  });

  it("rejects empty trackUris list", () => {
    const input = {
      year: 2024,
      trackUris: [],
    };

    const result = CreatePlaylistSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
