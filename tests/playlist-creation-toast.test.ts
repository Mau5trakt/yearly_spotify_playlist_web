import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { PlaylistCreationToast } from "../components";
import { useI18nStore } from "../lib/i18n";
import type { SpotifyTrackItem } from "../lib/spotify";

function mockTrack(id: string, imgUrl?: string): SpotifyTrackItem {
  return {
    id,
    uri: `spotify:track:${id}`,
    name: `Track ${id}`,
    artists: ["Artist A"],
    album: { name: "Album", imageUrl: imgUrl },
    addedAt: "2024-01-01T00:00:00Z",
    year: 2024,
  };
}

describe("PlaylistCreationToast Component Suite", () => {
  it("renders 2x2 collage structure and displays current playlist details", () => {
    useI18nStore.getState().setLocale("en");

    const tracks = [
      mockTrack("1", "https://example.com/1.jpg"),
      mockTrack("2", "https://example.com/2.jpg"),
      mockTrack("3", "https://example.com/3.jpg"),
      mockTrack("4", "https://example.com/4.jpg"),
    ];

    const rawHtml = renderToString(
      React.createElement(PlaylistCreationToast, {
        year: 2025,
        current: 2,
        total: 6,
        trackCount: 295,
        tracks,
      })
    );
    const html = rawHtml.replace(/<!-- -->/g, "");

    // Verify root container and role
    expect(html).toContain('role="status"');
    expect(html).toContain('data-testid="playlist-creation-toast"');

    // Verify 2x2 collage structure
    expect(html).toContain('data-testid="collage-grid"');
    expect(html).toContain('data-testid="quadrant-0"');
    expect(html).toContain('data-testid="quadrant-1"');
    expect(html).toContain('data-testid="quadrant-2"');
    expect(html).toContain('data-testid="quadrant-3"');

    // Verify playlist name and year
    expect(html).toContain("Liked");
    expect(html).toContain("2025");
    expect(html).toContain("295 tracks");
    expect(html).toContain("(2/6)");
  });

  it("renders single 1x1 cover when playlist has fewer than 4 images (< 4 validation)", () => {
    const tracksWithTwoImages = [
      mockTrack("1", "https://example.com/single.jpg"),
      mockTrack("2", "https://example.com/second.jpg"),
    ];

    const html = renderToString(
      React.createElement(PlaylistCreationToast, {
        year: 2022,
        current: 1,
        total: 3,
        trackCount: 2,
        tracks: tracksWithTwoImages,
      })
    );

    expect(html).toContain('data-testid="single-cover-grid"');
    expect(html).not.toContain('data-testid="collage-grid"');
    expect(html).toContain("https://example.com/single.jpg");
  });

  it("handles empty or missing album image URLs gracefully with single placeholder", () => {
    const tracksWithoutImages = [mockTrack("1"), mockTrack("2")];

    const html = renderToString(
      React.createElement(PlaylistCreationToast, {
        year: 2020,
        current: 1,
        total: 1,
        trackCount: 15,
        tracks: tracksWithoutImages,
      })
    );

    expect(html).toContain('data-testid="single-cover-grid"');
    expect(html).not.toContain('data-testid="collage-grid"');
    expect(html).toContain("2020");
    expect(html).toContain("15 tracks");
  });
});
