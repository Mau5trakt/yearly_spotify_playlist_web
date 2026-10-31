import { getValidAccessToken, SPOTIFY_API_BASE_URL } from "./client";
import { getSession } from "../auth";
import type { CreatePlaylistInput } from "./schemas";
import { selectNewTracks, chunkArray } from "../sync/dedup";

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

async function addTrackBatchesSequentially(
  playlistId: string,
  batches: string[][],
  accessToken: string,
  startPosition?: number,
  index = 0
): Promise<number> {
  if (index >= batches.length) return 0;
  const batch = batches[index];

  const payload: { uris: string[]; position?: number } = {
    uris: batch,
  };

  if (typeof startPosition === "number") {
    payload.position = startPosition;
  }

  const addRes = await fetch(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!addRes.ok) {
    const errText = await addRes.text();
    throw new Error(`Failed to add tracks to playlist: ${addRes.status} ${errText}`);
  }

  const nextPosition = typeof startPosition === "number" ? startPosition + batch.length : undefined;

  const nextCount = await addTrackBatchesSequentially(
    playlistId,
    batches,
    accessToken,
    nextPosition,
    index + 1
  );
  return batch.length + nextCount;
}

export async function fetchPlaylistTrackUris(
  playlistId: string,
  token?: string
): Promise<Set<string>> {
  const accessToken = token || (await getValidAccessToken());
  const uris = new Set<string>();
  const limit = 50;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to fetch playlist tracks: ${res.status} ${errText}`);
    }

    const data = (await res.json()) as {
      next: string | null;
      items?: Array<{
        track?: { uri?: string | null } | null;
        item?: { uri?: string | null } | null;
      }>;
    };

    const items = data.items || [];
    for (const entry of items) {
      const uri = entry.track?.uri || entry.item?.uri;
      if (typeof uri === "string" && uri.trim().length > 0) {
        uris.add(uri.trim());
      }
    }

    offset += items.length;
    hasMore = Boolean(data.next) && items.length > 0;
  }

  return uris;
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
  let alreadyExisted = false;

  let offset = 0;
  let hasMorePlaylists = true;

  while (hasMorePlaylists) {
    const userPlaylistsRes = await fetch(
      `${SPOTIFY_API_BASE_URL}/me/playlists?offset=${offset}&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userPlaylistsRes.ok) break;

    const playlistsData = (await userPlaylistsRes.json()) as {
      next: string | null;
      items: Array<{
        id: string;
        name: string;
        owner?: { id: string };
        external_urls: { spotify: string };
      }>;
    };

    const existing = playlistsData.items?.find((p) => {
      const isOwned = !p.owner || p.owner.id === userId;
      return isOwned && p.name.trim().toLowerCase() === playlistName.trim().toLowerCase();
    });

    if (existing) {
      playlistId = existing.id;
      playlistUrl = existing.external_urls.spotify;
      alreadyExisted = true;
      break;
    }

    offset += playlistsData.items?.length || 50;
    hasMorePlaylists = Boolean(playlistsData.next) && (playlistsData.items?.length ?? 0) > 0;
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

  // 3. Deduplicate against existing tracks in the playlist
  let existingUris = new Set<string>();
  if (alreadyExisted) {
    existingUris = await fetchPlaylistTrackUris(playlistId, accessToken);
  }

  const pendingUris = selectNewTracks(input.trackUris, existingUris);
  const skippedCount = input.trackUris.length - pendingUris.length;

  // 4. If all tracks already exist in the playlist, it's a safe no-op!
  if (pendingUris.length === 0) {
    return {
      playlistId,
      playlistUrl,
      name: playlistName,
      year: input.year,
      addedCount: 0,
      skippedCount,
      alreadyExisted,
    };
  }

  // 5. Add pending tracks in batches of up to 100
  // When reusing existing playlist, insert at position 0 to keep newest liked songs at the top
  const insertPosition = alreadyExisted ? 0 : undefined;
  const batches = chunkArray(pendingUris, 100);

  const totalAdded = await addTrackBatchesSequentially(
    playlistId,
    batches,
    accessToken,
    insertPosition
  );

  return {
    playlistId,
    playlistUrl,
    name: playlistName,
    year: input.year,
    addedCount: totalAdded,
    skippedCount,
    alreadyExisted,
  };
}
