import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { PlaylistsView } from "../components";
import { useI18nStore } from "../lib/i18n";
import type { CreatedPlaylistRecord } from "../store/useSyncStore";

describe("PlaylistsView Component Suite", () => {
  it("renders 2x2 cover collage when playlist has 4 or more cover images", () => {
    useI18nStore.getState().setLocale("en");

    const playlists: CreatedPlaylistRecord[] = [
      {
        year: 2024,
        name: "Liked 2024",
        url: "https://open.spotify.com/playlist/2024",
        addedCount: 50,
        coverImages: [
          "https://example.com/cover1.jpg",
          "https://example.com/cover2.jpg",
          "https://example.com/cover3.jpg",
          "https://example.com/cover4.jpg",
          "https://example.com/cover5.jpg",
        ],
      },
    ];

    const html = renderToString(React.createElement(PlaylistsView, { playlists }));

    expect(html).toContain('data-testid="card-cover-wrapper"');
    expect(html).toContain('data-testid="cover-grid-2x2"');
    expect(html).toContain('data-testid="summary-quadrant-0"');
    expect(html).toContain('data-testid="summary-quadrant-1"');
    expect(html).toContain('data-testid="summary-quadrant-2"');
    expect(html).toContain('data-testid="summary-quadrant-3"');
    expect(html).not.toContain('data-testid="single-card-cover"');
    expect(html).toContain("Liked 2024");
    expect(html).toContain("50 tracks");
  });

  it("renders a single 1x1 cover image when playlist has fewer than 4 cover images (< 4 validation)", () => {
    useI18nStore.getState().setLocale("en");

    const playlists: CreatedPlaylistRecord[] = [
      {
        year: 2021,
        name: "Liked 2021",
        url: "https://open.spotify.com/playlist/2021",
        addedCount: 2,
        coverImages: ["https://example.com/single1.jpg", "https://example.com/single2.jpg"],
      },
    ];

    const html = renderToString(React.createElement(PlaylistsView, { playlists }));

    expect(html).toContain('data-testid="card-cover-wrapper"');
    expect(html).toContain('data-testid="single-card-cover"');
    expect(html).not.toContain('data-testid="cover-grid-2x2"');
    expect(html).toContain("https://example.com/single1.jpg");
  });

  it("renders placeholder icon when playlist has no cover images", () => {
    const playlists: CreatedPlaylistRecord[] = [
      {
        year: 2019,
        name: "Liked 2019",
        url: "https://open.spotify.com/playlist/2019",
        addedCount: 0,
        skippedCount: 10,
        coverImages: [],
      },
    ];

    const html = renderToString(React.createElement(PlaylistsView, { playlists }));

    expect(html).toContain('data-testid="cover-placeholder"');
  });

  it("renders null when playlist list is empty", () => {
    const html = renderToString(React.createElement(PlaylistsView, { playlists: [] }));
    expect(html).toBe("");
  });
});
