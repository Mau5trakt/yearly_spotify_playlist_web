import { describe, expect, it } from "bun:test";
import { groupTracksByYear, calculateYearStats } from "../lib/sync";
import type { SpotifyTrackItem } from "../lib/spotify";

describe("groupTracksByYear", () => {
  it("groups tracks correctly by their parsed year", () => {
    const mockTracks: SpotifyTrackItem[] = [
      {
        id: "1",
        uri: "spotify:track:1",
        name: "Song 2024 A",
        artists: ["Artist A"],
        album: { name: "Album 2024" },
        addedAt: "2024-03-15T12:00:00Z",
        year: 2024,
      },
      {
        id: "2",
        uri: "spotify:track:2",
        name: "Song 2024 B",
        artists: ["Artist B"],
        album: { name: "Album 2024" },
        addedAt: "2024-06-20T12:00:00Z",
        year: 2024,
      },
      {
        id: "3",
        uri: "spotify:track:3",
        name: "Song 2021 A",
        artists: ["Artist C"],
        album: { name: "Album 2021" },
        addedAt: "2021-01-10T12:00:00Z",
        year: 2021,
      },
    ];

    const groups = groupTracksByYear(mockTracks);

    expect(groups.size).toBe(2);
    expect(groups.has(2024)).toBe(true);
    expect(groups.has(2021)).toBe(true);

    const group2024 = groups.get(2024)!;
    expect(group2024.tracks.length).toBe(2);
    expect(group2024.uris).toEqual(["spotify:track:1", "spotify:track:2"]);

    const group2021 = groups.get(2021)!;
    expect(group2021.tracks.length).toBe(1);
    expect(group2021.uris).toEqual(["spotify:track:3"]);
  });

  it("handles empty track list gracefully", () => {
    const groups = groupTracksByYear([]);
    expect(groups.size).toBe(0);
  });
});

describe("calculateYearStats", () => {
  it("computes totals, percentages, top year, and min/max years accurately", () => {
    const mockTracks: SpotifyTrackItem[] = [
      {
        id: "1",
        uri: "spotify:track:1",
        name: "A",
        artists: [],
        album: { name: "" },
        addedAt: "",
        year: 2023,
      },
      {
        id: "2",
        uri: "spotify:track:2",
        name: "B",
        artists: [],
        album: { name: "" },
        addedAt: "",
        year: 2024,
      },
      {
        id: "3",
        uri: "spotify:track:3",
        name: "C",
        artists: [],
        album: { name: "" },
        addedAt: "",
        year: 2024,
      },
      {
        id: "4",
        uri: "spotify:track:4",
        name: "D",
        artists: [],
        album: { name: "" },
        addedAt: "",
        year: 2020,
      },
    ];

    const groups = groupTracksByYear(mockTracks);
    const stats = calculateYearStats(groups);

    expect(stats.totalTracks).toBe(4);
    expect(stats.earliestYear).toBe(2020);
    expect(stats.latestYear).toBe(2024);
    expect(stats.topYear).toEqual({ year: 2024, count: 2 });

    const item2024 = stats.yearDistribution.find((y) => y.year === 2024);
    expect(item2024?.count).toBe(2);
    expect(item2024?.percentage).toBe(50);

    const item2020 = stats.yearDistribution.find((y) => y.year === 2020);
    expect(item2020?.count).toBe(1);
    expect(item2020?.percentage).toBe(25);
  });

  it("handles empty groups properly", () => {
    const stats = calculateYearStats(new Map());
    expect(stats.totalTracks).toBe(0);
    expect(stats.topYear).toBeNull();
    expect(stats.earliestYear).toBeNull();
    expect(stats.latestYear).toBeNull();
    expect(stats.yearDistribution).toEqual([]);
  });
});
