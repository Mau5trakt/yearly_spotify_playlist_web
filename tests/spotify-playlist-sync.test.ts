import { describe, expect, it, mock, afterEach } from "bun:test";

// Mock auth and spotify client
mock.module("../lib/auth", () => ({
  getSession: async () => ({
    isLoggedIn: true,
    user: { id: "test-user-1" },
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresAt: Date.now() + 3600000,
    save: async () => {},
  }),
}));

mock.module("../lib/spotify/client", () => ({
  SPOTIFY_API_BASE_URL: "https://api.spotify.com/v1",
  getValidAccessToken: async () => "mock-access-token",
}));

import { fetchPlaylistTrackUris, createOrUpdateYearlyPlaylist } from "../lib/spotify/service";

interface RecordedPostCall {
  url: string;
  body: Record<string, unknown>;
}

describe("fetchPlaylistTrackUris", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("fetches all track URIs from a single-page playlist", async () => {
    globalThis.fetch = (async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes("/playlists/playlist-1/tracks")) {
        return new Response(
          JSON.stringify({
            items: [{ track: { uri: "spotify:track:1" } }, { track: { uri: "spotify:track:2" } }],
            next: null,
            total: 2,
          }),
          { status: 200 }
        );
      }
      return new Response("Not found", { status: 404 });
    }) as unknown as typeof fetch;

    const uris = await fetchPlaylistTrackUris("playlist-1", "token-xyz");

    expect(uris).toEqual(new Set(["spotify:track:1", "spotify:track:2"]));
  });

  it("paginates across multiple pages to collect all URIs", async () => {
    globalThis.fetch = (async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes("offset=0")) {
        return new Response(
          JSON.stringify({
            items: [{ track: { uri: "spotify:track:a" } }],
            next: "https://api.spotify.com/v1/playlists/p1/tracks?offset=50&limit=50",
            total: 2,
          }),
          { status: 200 }
        );
      }
      if (urlStr.includes("offset=1") || urlStr.includes("offset=50")) {
        return new Response(
          JSON.stringify({
            items: [{ item: { uri: "spotify:track:b" } }],
            next: null,
            total: 2,
          }),
          { status: 200 }
        );
      }
      return new Response("Not found", { status: 404 });
    }) as unknown as typeof fetch;

    const uris = await fetchPlaylistTrackUris("p1", "token-xyz");

    expect(uris).toEqual(new Set(["spotify:track:a", "spotify:track:b"]));
  });

  it("skips entries with missing tracks or empty URIs", async () => {
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({
          items: [
            { track: null },
            { track: { uri: "" } },
            { track: { uri: "   " } },
            { track: { uri: "spotify:track:valid" } },
            {},
          ],
          next: null,
          total: 5,
        }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;

    const uris = await fetchPlaylistTrackUris("p1", "token-xyz");
    expect(uris).toEqual(new Set(["spotify:track:valid"]));
  });

  it("throws descriptive error when Spotify API returns non-OK status", async () => {
    globalThis.fetch = (async () => {
      return new Response("Forbidden", { status: 403 });
    }) as unknown as typeof fetch;

    expect(fetchPlaylistTrackUris("p1", "token-xyz")).rejects.toThrow(
      "Failed to fetch playlist tracks: 403 Forbidden"
    );
  });
});

describe("createOrUpdateYearlyPlaylist idempotency and deduplication", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("creates a new playlist and adds all tracks when playlist does not exist yet", async () => {
    const fetchCalls: Array<{ url: string; method: string; body?: Record<string, unknown> }> = [];

    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = input.toString();
      const method = init?.method || "GET";
      const body = init?.body
        ? (JSON.parse(init.body.toString()) as Record<string, unknown>)
        : undefined;
      fetchCalls.push({ url, method, body });

      // 1. Fetch user playlists
      if (url.includes("/me/playlists") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [],
            next: null,
          }),
          { status: 200 }
        );
      }

      // 2. Create playlist
      if (url.includes("/me/playlists") && method === "POST") {
        return new Response(
          JSON.stringify({
            id: "new-playlist-id",
            external_urls: { spotify: "https://open.spotify.com/playlist/new-playlist-id" },
          }),
          { status: 200 }
        );
      }

      // 3. Add tracks
      if (url.includes("/playlists/new-playlist-id/tracks") && method === "POST") {
        return new Response(JSON.stringify({ snapshot_id: "snap-1" }), { status: 200 });
      }

      return new Response("Not found", { status: 404 });
    }) as unknown as typeof fetch;

    const result = await createOrUpdateYearlyPlaylist({
      year: "2023",
      trackUris: ["spotify:track:1", "spotify:track:2", "spotify:track:3"],
      isPublic: true,
    });

    expect(result.playlistId).toBe("new-playlist-id");
    expect(result.addedCount).toBe(3);
    expect(result.skippedCount).toBe(0);
    expect(result.alreadyExisted).toBe(false);

    // Verify create was called
    const createCall = fetchCalls.find(
      (c) => c.url.includes("/me/playlists") && c.method === "POST"
    );
    expect(createCall).toBeDefined();
    expect(createCall?.body?.name).toBe("Liked 2023");

    // Verify tracks added without position param
    const addCall = fetchCalls.find((c) => c.url.includes("/tracks") && c.method === "POST");
    expect(addCall).toBeDefined();
    expect(addCall?.body?.uris).toEqual(["spotify:track:1", "spotify:track:2", "spotify:track:3"]);
    expect(addCall?.body?.position).toBeUndefined();
  });

  it("reuses existing playlist, skips already present tracks, and inserts deltas at position 0", async () => {
    const fetchCalls: Array<{ url: string; method: string; body?: Record<string, unknown> }> = [];

    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = input.toString();
      const method = init?.method || "GET";
      const body = init?.body
        ? (JSON.parse(init.body.toString()) as Record<string, unknown>)
        : undefined;
      fetchCalls.push({ url, method, body });

      // 1. Fetch user playlists -> found existing
      if (url.includes("/me/playlists") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: "existing-playlist-id",
                name: "Liked 2023",
                owner: { id: "test-user-1" },
                external_urls: {
                  spotify: "https://open.spotify.com/playlist/existing-playlist-id",
                },
              },
            ],
            next: null,
          }),
          { status: 200 }
        );
      }

      // 2. Fetch existing playlist tracks (track 1 and track 2 already exist)
      if (url.includes("/playlists/existing-playlist-id/tracks") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [{ track: { uri: "spotify:track:1" } }, { track: { uri: "spotify:track:2" } }],
            next: null,
            total: 2,
          }),
          { status: 200 }
        );
      }

      // 3. Add tracks
      if (url.includes("/playlists/existing-playlist-id/tracks") && method === "POST") {
        return new Response(JSON.stringify({ snapshot_id: "snap-2" }), { status: 200 });
      }

      return new Response("Not found", { status: 404 });
    }) as unknown as typeof fetch;

    const result = await createOrUpdateYearlyPlaylist({
      year: "2023",
      trackUris: ["spotify:track:1", "spotify:track:2", "spotify:track:3"],
      isPublic: true,
    });

    expect(result.playlistId).toBe("existing-playlist-id");
    expect(result.addedCount).toBe(1);
    expect(result.skippedCount).toBe(2);
    expect(result.alreadyExisted).toBe(true);

    // Verify create was NOT called
    const createCall = fetchCalls.find(
      (c) => c.url.includes("/me/playlists") && c.method === "POST"
    );
    expect(createCall).toBeUndefined();

    // Verify only track 3 was added at position 0
    const addCall = fetchCalls.find((c) => c.url.includes("/tracks") && c.method === "POST");
    expect(addCall).toBeDefined();
    expect(addCall?.body?.uris).toEqual(["spotify:track:3"]);
    expect(addCall?.body?.position).toBe(0);
  });

  it("is a complete no-op when all tracks already exist in the playlist", async () => {
    const fetchCalls: Array<{ url: string; method: string; body?: Record<string, unknown> }> = [];

    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = input.toString();
      const method = init?.method || "GET";
      const body = init?.body
        ? (JSON.parse(init.body.toString()) as Record<string, unknown>)
        : undefined;
      fetchCalls.push({ url, method, body });

      if (url.includes("/me/playlists") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: "old-playlist-id",
                name: "Liked 2023",
                owner: { id: "test-user-1" },
                external_urls: { spotify: "https://open.spotify.com/playlist/old-playlist-id" },
              },
            ],
            next: null,
          }),
          { status: 200 }
        );
      }

      if (url.includes("/playlists/old-playlist-id/tracks") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [
              { track: { uri: "spotify:track:1" } },
              { track: { uri: "spotify:track:2" } },
              { track: { uri: "spotify:track:3" } },
            ],
            next: null,
            total: 3,
          }),
          { status: 200 }
        );
      }

      return new Response("Not found", { status: 404 });
    }) as unknown as typeof fetch;

    const result = await createOrUpdateYearlyPlaylist({
      year: "2023",
      trackUris: ["spotify:track:1", "spotify:track:2", "spotify:track:3"],
      isPublic: true,
    });

    expect(result.addedCount).toBe(0);
    expect(result.skippedCount).toBe(3);
    expect(result.alreadyExisted).toBe(true);

    // Verify ZERO POST calls were made
    const postCalls = fetchCalls.filter((c) => c.method === "POST");
    expect(postCalls.length).toBe(0);
  });

  it("handles batching and advances position parameter sequentially for large delta sets", async () => {
    const postCalls: RecordedPostCall[] = [];

    // 205 new tracks to add
    const manyUris = Array.from({ length: 205 }, (_, i) => `spotify:track:new_${i}`);

    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = input.toString();
      const method = init?.method || "GET";
      const body = init?.body ? (JSON.parse(init.body.toString()) as Record<string, unknown>) : {};

      if (url.includes("/me/playlists") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: "existing-p",
                name: "Liked 2024",
                owner: { id: "test-user-1" },
                external_urls: { spotify: "https://open.spotify.com/playlist/existing-p" },
              },
            ],
            next: null,
          }),
          { status: 200 }
        );
      }

      if (url.includes("/playlists/existing-p/tracks") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [{ track: { uri: "spotify:track:old_1" } }],
            next: null,
            total: 1,
          }),
          { status: 200 }
        );
      }

      if (url.includes("/playlists/existing-p/tracks") && method === "POST") {
        postCalls.push({ url, body });
        return new Response(JSON.stringify({ snapshot_id: "snap" }), { status: 200 });
      }

      return new Response("Not found", { status: 404 });
    }) as unknown as typeof fetch;

    const result = await createOrUpdateYearlyPlaylist({
      year: "2024",
      trackUris: manyUris,
      isPublic: true,
    });

    expect(result.addedCount).toBe(205);
    expect(result.skippedCount).toBe(0);
    expect(postCalls.length).toBe(3);

    // Batch 1: 100 tracks at position 0
    expect((postCalls[0].body.uris as string[]).length).toBe(100);
    expect(postCalls[0].body.position).toBe(0);

    // Batch 2: 100 tracks at position 100
    expect((postCalls[1].body.uris as string[]).length).toBe(100);
    expect(postCalls[1].body.position).toBe(100);

    // Batch 3: 5 tracks at position 200
    expect((postCalls[2].body.uris as string[]).length).toBe(5);
    expect(postCalls[2].body.position).toBe(200);
  });
});
