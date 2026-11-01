import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { LiveTrackToasts } from "../components";
import type { SpotifyTrackItem } from "../lib/spotify";

function createMockTrack(id: string, name: string): SpotifyTrackItem {
  return {
    id,
    uri: `spotify:track:${id}`,
    name,
    artists: ["Test Artist"],
    album: { name: "Test Album", imageUrl: `https://example.com/${id}.jpg` },
    addedAt: "2024-01-01T00:00:00Z",
    year: 2024,
  };
}

describe("LiveTrackToasts TDD Suite", () => {
  it("strictly enforces a maximum of 5 cards rendered when passed 20 tracks", () => {
    const twentyTracks = Array.from({ length: 20 }, (_, i) =>
      createMockTrack(`track-${i + 1}`, `Song Number ${i + 1}`)
    );

    const html = renderToString(React.createElement(LiveTrackToasts, { tracks: twentyTracks }));

    const cardMatches = html.match(/data-testid="toast-card"/g) || [];
    expect(cardMatches.length).toBeLessThanOrEqual(5);
    expect(cardMatches.length).toBe(5);
  });

  it("places the cover image strictly on the LEFT (before text info) and text on the RIGHT", () => {
    const singleTrack = [createMockTrack("left-test", "Left Cover Song")];
    const html = renderToString(React.createElement(LiveTrackToasts, { tracks: singleTrack }));

    const imgIndex = html.indexOf('data-testid="cover-image"');
    const infoIndex = html.indexOf('data-testid="track-info"');

    expect(imgIndex).toBeGreaterThan(-1);
    expect(infoIndex).toBeGreaterThan(-1);
    expect(imgIndex).toBeLessThan(infoIndex); // Cover image precedes text info (left alignment)

    // Verify 64x64px dimensions
    expect(html).toContain('width="64"');
    expect(html).toContain('height="64"');
  });

  it("places the placeholder icon on the LEFT when album cover image is missing", () => {
    const trackWithoutImage: SpotifyTrackItem[] = [
      {
        id: "no-image",
        uri: "spotify:track:no-image",
        name: "No Image Song",
        artists: ["Solo Artist"],
        album: { name: "No Image Album" },
        addedAt: "2024-01-01T00:00:00Z",
        year: 2024,
      },
    ];

    const html = renderToString(
      React.createElement(LiveTrackToasts, { tracks: trackWithoutImage })
    );
    const placeholderIndex = html.indexOf('data-testid="cover-placeholder"');
    const infoIndex = html.indexOf('data-testid="track-info"');

    expect(placeholderIndex).toBeGreaterThan(-1);
    expect(infoIndex).toBeGreaterThan(-1);
    expect(placeholderIndex).toBeLessThan(infoIndex); // Placeholder icon precedes text info (left alignment)
  });

  it("renders null when tracks list is empty", () => {
    const html = renderToString(React.createElement(LiveTrackToasts, { tracks: [] }));
    expect(html).toBe("");
  });

  it("renders track metadata including year badge, song name and artist list", () => {
    const track = [createMockTrack("meta-1", "Master of Puppets")];
    const rawHtml = renderToString(React.createElement(LiveTrackToasts, { tracks: track }));
    const html = rawHtml.replace(/<!-- -->/g, "");

    expect(html).toContain("Año 2024");
    expect(html).toContain("Master of Puppets");
    expect(html).toContain("Test Artist");
  });
});
