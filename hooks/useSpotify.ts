"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { TracksPageResponse, CreatePlaylistInput, SpotifyTrackItem } from "@/lib/spotify";
import { groupTracksByYear, calculateYearStats } from "@/lib/sync";
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
  const createPlaylistMutation = useCreatePlaylistMutation();

  const startSync = async () => {
    if (store.status === "fetching" || store.status === "creating") {
      return;
    }

    store.startSyncSession();

    try {
      const allTracks: SpotifyTrackItem[] = [];
      let offset = 0;
      const limit = 50;
      let hasMore = true;

      // Phase 1: Batch download via Axios
      while (hasMore) {
        store.setCurrentAction(`Descargando canciones guardadas (${offset}...)...`);

        const data = await fetchLikedTracksPageApi(offset, limit);
        allTracks.push(...data.items);
        store.enqueueTracks(data.items);

        store.setProgress(data.total, allTracks.length);

        offset += limit;
        hasMore = data.hasMore && allTracks.length < data.total;
      }

      store.stopQueueTicker();

      if (allTracks.length === 0) {
        store.setCompleted("No se encontraron canciones guardadas en tu biblioteca.");
        return;
      }

      // Phase 2: In-memory analysis and stats calculation
      store.setStatus("analyzing");
      store.setCurrentAction("Analizando canciones y agrupando por año de guardado...");

      const groups = groupTracksByYear(allTracks);
      const stats = calculateYearStats(groups);
      store.setStats(stats);

      store.setStatus("creating");
      store.setCurrentAction(
        `Se encontraron ${groups.size} años distintos. Preparando creación de playlists...`
      );

      // Phase 3: Create yearly playlists sequentially via Axios mutation
      const createdPlaylists: CreatedPlaylistRecord[] = [];
      const years = Array.from(groups.keys()).sort((a, b) => b - a);

      const syncYearStep = async (index: number) => {
        if (index >= years.length) return;
        const year = years[index];
        const group = groups.get(year)!;

        store.setCurrentAction(
          `Creando playlist de ${year} (${index + 1}/${years.length}) con ${group.tracks.length} canciones...`
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

      store.setCompleted("¡Listo! Todas tus playlists anuales han sido generadas con éxito.");
    } catch (err) {
      store.stopQueueTicker();
      const message = err instanceof Error ? err.message : "Error en la sincronización";
      store.setError(message);
    }
  };

  return {
    ...store,
    startSync,
    isCreatingPlaylist: createPlaylistMutation.isPending,
  };
}
