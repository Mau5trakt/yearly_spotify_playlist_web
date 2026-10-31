import { create } from "zustand";
import type { SpotifyTrackItem } from "@/lib/spotify";
import type { YearStats } from "@/lib/sync";

export type SyncStatus = "idle" | "fetching" | "analyzing" | "creating" | "completed" | "error";

export interface CreatedPlaylistRecord {
  year: number;
  name: string;
  url: string;
  addedCount: number;
}

interface SyncState {
  status: SyncStatus;
  totalTracks: number;
  fetchedCount: number;
  currentAction: string;
  stats: YearStats | null;
  createdPlaylists: CreatedPlaylistRecord[];
  recentTracks: SpotifyTrackItem[];
  latestTrack: SpotifyTrackItem | null;
  error: string | null;

  startSyncSession: () => void;
  enqueueTracks: (tracks: SpotifyTrackItem[]) => void;
  stopQueueTicker: () => void;
  setCurrentAction: (action: string) => void;
  setProgress: (total: number, fetched: number) => void;
  setStatus: (status: SyncStatus) => void;
  setStats: (stats: YearStats) => void;
  setCreatedPlaylists: (playlists: CreatedPlaylistRecord[]) => void;
  setCompleted: (actionMessage?: string) => void;
  setError: (error: string) => void;
  reset: () => void;
}

let feedInterval: ReturnType<typeof setInterval> | null = null;
let pendingTrackQueue: SpotifyTrackItem[] = [];

export const useSyncStore = create<SyncState>((set) => ({
  status: "idle",
  totalTracks: 0,
  fetchedCount: 0,
  currentAction: "",
  stats: null,
  createdPlaylists: [],
  recentTracks: [],
  latestTrack: null,
  error: null,

  reset: () => {
    if (feedInterval) {
      clearInterval(feedInterval);
      feedInterval = null;
    }
    pendingTrackQueue = [];
    set({
      status: "idle",
      totalTracks: 0,
      fetchedCount: 0,
      currentAction: "",
      stats: null,
      createdPlaylists: [],
      recentTracks: [],
      latestTrack: null,
      error: null,
    });
  },

  startSyncSession: () => {
    if (feedInterval) {
      clearInterval(feedInterval);
      feedInterval = null;
    }
    pendingTrackQueue = [];

    set({
      status: "fetching",
      totalTracks: 0,
      fetchedCount: 0,
      currentAction: "Iniciando descarga de canciones guardadas...",
      error: null,
      createdPlaylists: [],
      recentTracks: [],
      latestTrack: null,
      stats: null,
    });

    feedInterval = setInterval(() => {
      if (pendingTrackQueue.length > 0) {
        const randomIndex = Math.floor(Math.random() * pendingTrackQueue.length);
        const nextTrack = pendingTrackQueue.splice(randomIndex, 1)[0];
        set((state) => ({
          latestTrack: nextTrack,
          recentTracks: [...state.recentTracks.slice(-4), nextTrack],
        }));
      }
    }, 320);
  },

  enqueueTracks: (tracks: SpotifyTrackItem[]) => {
    pendingTrackQueue.push(...tracks);
  },

  stopQueueTicker: () => {
    if (feedInterval) {
      clearInterval(feedInterval);
      feedInterval = null;
    }
  },

  setCurrentAction: (currentAction: string) => set({ currentAction }),

  setProgress: (totalTracks: number, fetchedCount: number) =>
    set({
      totalTracks,
      fetchedCount,
      currentAction: `Descargadas ${fetchedCount} de ${totalTracks} canciones...`,
    }),

  setStatus: (status: SyncStatus) => set({ status }),

  setStats: (stats: YearStats) => set({ stats }),

  setCreatedPlaylists: (createdPlaylists: CreatedPlaylistRecord[]) => set({ createdPlaylists }),

  setCompleted: (
    actionMessage = "¡Listo! Todas tus playlists anuales han sido generadas con éxito."
  ) =>
    set({
      status: "completed",
      currentAction: actionMessage,
    }),

  setError: (error: string) =>
    set({
      status: "error",
      error,
      currentAction: "Error en la sincronización.",
    }),
}));
