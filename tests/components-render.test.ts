import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { Header, LandingHero, ProgressBar, StatsView, LiveTrackToasts } from "../components";
import { useI18nStore } from "../lib/i18n";

describe("Component Rendering & SVG Safety Suite", () => {
  it("renders Header with explicitly sized SVG logo (width=32, height=32)", () => {
    useI18nStore.getState().setLocale("en");
    const html = renderToString(React.createElement(Header, { user: null }));
    expect(html).toContain('width="32"');
    expect(html).toContain('height="32"');
    expect(html).toContain("Yearly Spotify Playlists");
  });

  it("renders Header with authenticated user badge and logout button", () => {
    useI18nStore.getState().setLocale("en");
    const html = renderToString(
      React.createElement(Header, {
        user: { id: "user1", displayName: "Enrique", imageUrl: "https://example.com/avatar.jpg" },
        onLogout: () => {},
      })
    );
    expect(html).toContain("Enrique");
    expect(html).toContain("https://example.com/avatar.jpg");
    expect(html).toContain("Log out");
  });

  it("renders LandingHero with explicitly sized Spotify CTA SVG (width=24, height=24)", () => {
    useI18nStore.getState().setLocale("en");
    const html = renderToString(React.createElement(LandingHero, { authError: null }));
    expect(html).toContain('width="24"');
    expect(html).toContain('height="24"');
    expect(html).toContain("Log in with Spotify");
    expect(html).toContain("/api/auth/login");
  });

  it("renders ProgressBar with track counts and percentage width", () => {
    useI18nStore.getState().setLocale("en");
    const rawHtml = renderToString(
      React.createElement(ProgressBar, {
        currentAction: "Downloading songs...",
        totalTracks: 100,
        fetchedCount: 50,
        status: "fetching",
      })
    );
    const html = rawHtml.replace(/<!-- -->/g, "");
    expect(html).toContain("Downloading songs...");
    expect(html).toContain("50 of 100 songs identified");
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="25"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain("width:25%");
  });

  it("renders StatsView with top year crown and distribution bars", () => {
    const stats = {
      totalTracks: 150,
      yearDistribution: [
        { year: 2024, count: 100, percentage: 66.7 },
        { year: 2023, count: 50, percentage: 33.3 },
      ],
      topYear: { year: 2024, count: 100 },
      earliestYear: 2023,
      latestYear: 2024,
    };

    const html = renderToString(React.createElement(StatsView, { stats }));
    expect(html).toContain("150");
    expect(html).toContain("👑");
    expect(html).toContain("2024");
    expect(html).toContain("2023 - 2024");
  });

  it("renders LiveTrackToasts with 64px image, track title and artist", () => {
    const mockTracks = [
      {
        id: "t1",
        uri: "spotify:track:1",
        name: "Bohemian Rhapsody",
        artists: ["Queen"],
        album: { name: "A Night at the Opera", imageUrl: "https://example.com/cover.jpg" },
        addedAt: "2024-01-01T00:00:00Z",
        year: 2024,
      },
    ];

    const rawHtml = renderToString(React.createElement(LiveTrackToasts, { tracks: mockTracks }));
    const html = rawHtml.replace(/<!-- -->/g, "");
    expect(html).toContain("Bohemian Rhapsody");
    expect(html).toContain("Queen");
    expect(html).toContain('width="64"');
    expect(html).toContain('height="64"');
    expect(html).toContain("https://example.com/cover.jpg");
  });
});
