import { describe, expect, it } from "bun:test";
import * as components from "../components";
import * as lib from "../lib";
import * as auth from "../lib/auth";
import * as spotify from "../lib/spotify";
import * as sync from "../lib/sync";

describe("Architecture & Barrel Imports Suite", () => {
  it("exports all 8 UI components through the components/ barrel export", () => {
    expect(components.Header).toBeDefined();
    expect(components.LandingHero).toBeDefined();
    expect(components.Dashboard).toBeDefined();
    expect(components.ProgressBar).toBeDefined();
    expect(components.StatsView).toBeDefined();
    expect(components.PlaylistsView).toBeDefined();
    expect(components.LiveTrackToasts).toBeDefined();
    expect(components.PlaylistCreationToast).toBeDefined();
  });

  it("exports auth responsibilities through lib/auth barrel", () => {
    expect(auth.getSession).toBeDefined();
    expect(auth.sessionOptions).toBeDefined();
    expect(auth.defaultSession).toBeDefined();
  });

  it("exports spotify responsibilities through lib/spotify barrel", () => {
    expect(spotify.buildSpotifyAuthorizeUrl).toBeDefined();
    expect(spotify.exchangeCodeForTokens).toBeDefined();
    expect(spotify.fetchLikedTracksPage).toBeDefined();
    expect(spotify.createOrUpdateYearlyPlaylist).toBeDefined();
    expect(spotify.CreatePlaylistSchema).toBeDefined();
  });

  it("exports pure sync and business logic through lib/sync barrel", () => {
    expect(sync.groupTracksByYear).toBeDefined();
    expect(sync.calculateYearStats).toBeDefined();
  });

  it("unifies all domain responsibilities in the root lib barrel", () => {
    expect(lib.getSession).toBeDefined();
    expect(lib.buildSpotifyAuthorizeUrl).toBeDefined();
    expect(lib.groupTracksByYear).toBeDefined();
    expect(lib.useTranslation).toBeDefined();
  });
});
