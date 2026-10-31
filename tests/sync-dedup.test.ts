import { describe, expect, it } from "bun:test";
import { selectNewTracks, chunkArray } from "../lib/sync/dedup";

describe("selectNewTracks", () => {
  it("filters out tracks already present while preserving original order", () => {
    const inputUris = ["spotify:track:1", "spotify:track:2", "spotify:track:3", "spotify:track:4"];
    const existingUris = new Set(["spotify:track:1", "spotify:track:3"]);

    const result = selectNewTracks(inputUris, existingUris);

    expect(result).toEqual(["spotify:track:2", "spotify:track:4"]);
  });

  it("returns all tracks when existing set is empty", () => {
    const inputUris = ["spotify:track:1", "spotify:track:2"];
    const existingUris = new Set<string>();

    const result = selectNewTracks(inputUris, existingUris);

    expect(result).toEqual(["spotify:track:1", "spotify:track:2"]);
  });

  it("returns empty array when all tracks are already present in playlist", () => {
    const inputUris = ["spotify:track:1", "spotify:track:2"];
    const existingUris = new Set(["spotify:track:1", "spotify:track:2", "spotify:track:3"]);

    const result = selectNewTracks(inputUris, existingUris);

    expect(result).toEqual([]);
  });

  it("handles empty input list gracefully", () => {
    const result = selectNewTracks([], new Set(["spotify:track:1"]));
    expect(result).toEqual([]);
  });

  it("deduplicates repeated URIs within the input list preserving first appearance", () => {
    const inputUris = [
      "spotify:track:1",
      "spotify:track:2",
      "spotify:track:1",
      "spotify:track:3",
      "spotify:track:2",
    ];
    const existingUris = new Set<string>();

    const result = selectNewTracks(inputUris, existingUris);

    expect(result).toEqual(["spotify:track:1", "spotify:track:2", "spotify:track:3"]);
  });
});

describe("chunkArray", () => {
  it("splits array into batches of specified size", () => {
    const items = [1, 2, 3, 4, 5];
    const batches = chunkArray(items, 2);

    expect(batches).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns empty array when input is empty", () => {
    expect(chunkArray([], 50)).toEqual([]);
  });

  it("throws an error if chunk size is non-positive", () => {
    expect(() => chunkArray([1, 2], 0)).toThrow("Chunk size must be positive");
    expect(() => chunkArray([1, 2], -1)).toThrow("Chunk size must be positive");
  });
});
