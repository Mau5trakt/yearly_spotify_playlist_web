"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { TracksPageResponse, CreatePlaylistInput, SpotifyTrackItem } from "@/lib/spotify";
import { groupTracksByYear, calculateYearStats } from "@/lib/sync";
import { useTranslation } from "@/lib/i18n";
import { useSyncStore, type CreatedPlaylistRecord } from "@/store/useSyncStore";

export interface CreatedPlaylistResponse {
  playlistId: string;
  playlistUrl: string;
  name: string;
  year: string;
  addedCount: number;
  skippedCount?: number;
  alreadyExisted?: boolean;
}

export async function fetchLikedTracksPageApi(
  offset: number = 0,
  limit: number = 50
): Promise<TracksPageResponse> {
  const { data } = await apiClient.get<TracksPageResponse>("/api/spotify/tracks", {
    params: { offset, limit },
  });
  return data;
}

export async function createPlaylistApi(
  input: CreatePlaylistInput
): Promise<CreatedPlaylistResponse> {
  const { data } = await apiClient.post<CreatedPlaylistResponse>("/api/spotify/playlists", input);
  return data;
}

export function useCreatePlaylistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlaylistApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotify_playlists"] });
    },
  });
}

export function useSpotifySync() {
  const store = useSyncStore();
  const { t } = useTranslation();
  const createPlaylistMutation = useCreatePlaylistMutation();

  const startSync = async () => {
    if (store.status === "fetching" || store.status === "creating") {
      return;
    }

    store.startSyncSession();
    store.setCurrentAction(t("progress.fetchingStart"));

    try {
      const allTracks: SpotifyTrackItem[] = [];
      let offset = 0;
      const limit = 50;
      let hasMore = true;

      // Phase 1: Batch download via Axios
      while (hasMore) {
        const data = await fetchLikedTracksPageApi(offset, limit);
        allTracks.push(...data.items);
        store.enqueueTracks(data.items);

        store.setProgress(data.total, allTracks.length);
        store.setCurrentAction(
          t("progress.fetchingProgress", { fetched: allTracks.length, total: data.total })
        );

        offset += limit;
        hasMore = data.hasMore && allTracks.length < data.total;
      }

      store.stopQueueTicker();

      if (allTracks.length === 0) {
        store.setCompleted(t("progress.noTracks"));
        return;
      }

      // Phase 2: In-memory analysis and stats calculation
      store.setStatus("analyzing");
      store.setCurrentAction(t("progress.analyzing"));

      // Identify the very first track saved in Spotify history
      const sortedByAddedAt = [...allTracks].sort(
        (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
      );
      const earliestTrack = sortedByAddedAt[0] || null;
      store.setEarliestSavedTrack(earliestTrack);

      const groups = groupTracksByYear(allTracks);
      const stats = calculateYearStats(groups);
      store.setStats(stats);

      store.setStatus("creating");
      store.setCurrentAction(t("progress.preparing", { count: groups.size }));

      // Phase 3: Create yearly playlists sequentially via Axios mutation
      const createdPlaylists: CreatedPlaylistRecord[] = [];
      const years = Array.from(groups.keys()).sort((a, b) => b - a);

      const syncYearStep = async (index: number) => {
        if (index >= years.length) {
          store.setCreatingPlaylist(null);
          return;
        }
        const year = years[index];
        const group = groups.get(year)!;

        store.setCreatingPlaylist({
          year,
          current: index + 1,
          total: years.length,
          count: group.tracks.length,
          tracks: group.tracks,
        });

        store.setCurrentAction(
          t("progress.creatingStep", {
            year,
            current: index + 1,
            total: years.length,
            count: group.tracks.length,
          })
        );

        const result = await createPlaylistMutation.mutateAsync({
          year: String(year),
          trackUris: group.uris,
          isPublic: true,
        });

        createdPlaylists.push({
          year,
          name: result.name,
          url: result.playlistUrl,
          addedCount: result.addedCount,
          skippedCount: result.skippedCount,
          alreadyExisted: result.alreadyExisted,
        });

        store.setCreatedPlaylists([...createdPlaylists]);
        await syncYearStep(index + 1);
      };

      await syncYearStep(0);

      store.setCompleted(t("progress.completed"));
    } catch (err) {
      store.stopQueueTicker();
      const message = err instanceof Error ? err.message : t("progress.error");
      store.setError(message);
    }
  };

  return {
    ...store,
    startSync,
    isCreatingPlaylist: createPlaylistMutation.isPending,
  };
}
