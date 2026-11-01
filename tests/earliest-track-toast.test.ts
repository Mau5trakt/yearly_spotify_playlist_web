import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { EarliestTrackToast } from "../components";
import { useI18nStore } from "../lib/i18n";
import type { SpotifyTrackItem } from "../lib/spotify";

function mockTrack(id: string, imgUrl?: string): SpotifyTrackItem {
  return {
    id,
    uri: `spotify:track:${id}`,
    name: "Stairway to Heaven (Remastered Long Title That Wraps Lines)",
    artists: ["Led Zeppelin", "Jimmy Page"],
    album: { name: "Led Zeppelin IV", imageUrl: imgUrl },
    addedAt: "2018-05-12T14:30:00Z",
    year: 2018,
  };
}

describe("EarliestTrackToast Component Suite", () => {
  it("renders toast with full multiline title, artist, date, and close button", () => {
    useI18nStore.getState().setLocale("en");

    const track = mockTrack("1", "https://example.com/cover.jpg");
    let closed = false;

    const html = renderToString(
      React.createElement(EarliestTrackToast, {
        track,
        onClose: () => {
          closed = true;
        },
      })
    );

    expect(html).toContain('data-testid="earliest-track-toast"');
    expect(html).toContain('data-testid="earliest-toast-close-btn"');
    expect(html).toContain('data-testid="earliest-cover-image"');
    expect(html).toContain('data-testid="earliest-song-title"');
    expect(html).toContain("Stairway to Heaven (Remastered Long Title That Wraps Lines)");
    expect(html).toContain("Led Zeppelin, Jimmy Page");
    expect(html).toContain('role="status"');
    expect(closed).toBe(false);
  });

  it("renders cover placeholder when track album image is missing", () => {
    const trackWithoutImg = mockTrack("2");

    const html = renderToString(
      React.createElement(EarliestTrackToast, {
        track: trackWithoutImg,
        onClose: () => {},
      })
    );

    expect(html).toContain('data-testid="earliest-cover-placeholder"');
    expect(html).not.toContain('data-testid="earliest-cover-image"');
  });
});
