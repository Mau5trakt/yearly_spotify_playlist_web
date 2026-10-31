import { getValidAccessToken, SPOTIFY_API_BASE_URL } from "./client";
import { getSession } from "../auth";
import type { CreatePlaylistInput } from "./schemas";

export interface SpotifyTrackItem {
  id: string;
  uri: string;
  name: string;
  artists: string[];
  album: {
    name: string;
    imageUrl?: string;
  };
  addedAt: string;
  year: number;
}

export interface TracksPageResponse {
  items: SpotifyTrackItem[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export async function fetchLikedTracksPage(
  offset: number = 0,
  limit: number = 50
): Promise<TracksPageResponse> {
  const accessToken = await getValidAccessToken();
  const clampedLimit = Math.min(Math.max(limit, 1), 50);

  const url = `${SPOTIFY_API_BASE_URL}/me/tracks?offset=${offset}&limit=${clampedLimit}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Spotify tracks error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    total: number;
    offset: number;
    limit: number;
    items: Array<{
      added_at: string;
      track: {
        id: string;
        uri: string;
        name: string;
        artists: Array<{ name: string }>;
        album: {
          name: string;
          images?: Array<{ url: string }>;
        };
      };
    }>;
  };

  const parsedItems: SpotifyTrackItem[] = data.items
    .filter((entry) => Boolean(entry.track && entry.track.id))
    .map((entry) => {
      const addedDate = new Date(entry.added_at);
      const year = isNaN(addedDate.getFullYear())
        ? new Date().getFullYear()
        : addedDate.getFullYear();

      return {
        id: entry.track.id,
        uri: entry.track.uri,
        name: entry.track.name,
        artists: entry.track.artists.map((a) => a.name),
        album: {
          name: entry.track.album.name,
          imageUrl: entry.track.album.images?.[0]?.url,
        },
        addedAt: entry.added_at,
        year,
      };
    });

  return {
    items: parsedItems,
    total: data.total,
    offset: data.offset,
    limit: data.limit,
    hasMore: data.offset + data.items.length < data.total,
  };
}

export async function createOrUpdateYearlyPlaylist(input: CreatePlaylistInput) {
  // Concurrently resolve token and session
  const [accessToken, session] = await Promise.all([getValidAccessToken(), getSession()]);
  const userId = session.user?.id;

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  const playlistName = input.customName || `Liked ${input.year}`;
  const description = `Tus canciones favoritas guardadas durante el año ${input.year}. Generado automáticamente con Yearly Spotify Playlists.`;

  // 1. Check if a playlist with this name already exists
  let playlistId: string | null = null;
  let playlistUrl: string = "";

  const userPlaylistsRes = await fetch(`${SPOTIFY_API_BASE_URL}/me/playlists?limit=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (userPlaylistsRes.ok) {
    const playlistsData = (await userPlaylistsRes.json()) as {
      items: Array<{
        id: string;
        name: string;
        external_urls: { spotify: string };
      }>;
    };
    const existing = playlistsData.items?.find(
      (p) => p.name.trim().toLowerCase() === playlistName.trim().toLowerCase()
    );
    if (existing) {
      playlistId = existing.id;
      playlistUrl = existing.external_urls.spotify;
    }
  }

  // 2. If it does not exist, create it
  if (!playlistId) {
    const createRes = await fetch(`${SPOTIFY_API_BASE_URL}/me/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistName,
        public: input.isPublic,
        description,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Failed to create playlist: ${createRes.status} ${errText}`);
    }

    const createdData = (await createRes.json()) as {
      id: string;
      external_urls: { spotify: string };
    };
    playlistId = createdData.id;
    playlistUrl = createdData.external_urls.spotify;
  }

  // 3. Add tracks in batches of up to 100
  const uniqueUris = Array.from(new Set(input.trackUris));
  const BATCH_SIZE = 100;

  if (uniqueUris.length <= BATCH_SIZE) {
    const addRes = await fetch(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: uniqueUris,
      }),
    });

    if (!addRes.ok) {
      const errText = await addRes.text();
      throw new Error(`Failed to add tracks to playlist: ${addRes.status} ${errText}`);
    }

    return {
      playlistId,
      playlistUrl,
      name: playlistName,
      year: input.year,
      addedCount: uniqueUris.length,
    };
  }

  const batches: string[][] = [];
  for (let i = 0; i < uniqueUris.length; i += BATCH_SIZE) {
    batches.push(uniqueUris.slice(i, i + BATCH_SIZE));
  }

  await Promise.all(
    batches.map(async (batch) => {
      const addRes = await fetch(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: batch,
        }),
      });

      if (!addRes.ok) {
        const errText = await addRes.text();
        throw new Error(`Failed to add tracks to playlist: ${addRes.status} ${errText}`);
      }
    })
  );

  return {
    playlistId,
    playlistUrl,
    name: playlistName,
    year: input.year,
    addedCount: uniqueUris.length,
  };
}
