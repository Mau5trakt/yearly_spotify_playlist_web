"use client";

import type { SpotifyTrackItem } from "@/lib/spotify";
import { LiveTrackToasts } from "./LiveTrackToasts";
import { PlaylistCreationToast } from "./PlaylistCreationToast";
import { useTranslation } from "@/lib/i18n";
import { useSyncStore } from "@/store/useSyncStore";
import styles from "@/styles/components/ProgressBar.module.scss";

interface ProgressBarProps {
  currentAction: string;
  totalTracks: number;
  fetchedCount: number;
  status: "idle" | "fetching" | "analyzing" | "creating" | "completed" | "error";
  recentTracks?: SpotifyTrackItem[];
  latestTrack?: SpotifyTrackItem | null;
}

const EMPTY_RECENT_TRACKS: SpotifyTrackItem[] = [];

export function ProgressBar({
  currentAction,
  totalTracks,
  fetchedCount,
  status,
  recentTracks = EMPTY_RECENT_TRACKS,
  latestTrack,
}: ProgressBarProps) {
  const { t } = useTranslation();
  const creatingPlaylist = useSyncStore((state) => state.creatingPlaylist);
  let percentage = 0;
  if (status === "fetching" && totalTracks > 0) {
    percentage = Math.min(Math.round((fetchedCount / totalTracks) * 50), 50); // Fetching = 0-50%
  } else if (status === "analyzing") {
    percentage = 55;
  } else if (status === "creating") {
    percentage = 80;
  } else if (status === "completed") {
    percentage = 100;
  }

  return (
    <div className={styles.progressContainer}>
      <div className={styles.statusText}>{currentAction}</div>

      {totalTracks > 0 && (
        <div className={styles.trackIndicator}>
          {t("progress.songsIdentified", { fetched: fetchedCount, total: totalTracks })}
        </div>
      )}

      <div
        className={styles.progressBarTrack}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("progress.progressBarAria")}
      >
        <div className={styles.progressBarFill} style={{ width: `${percentage}%` }} />
      </div>

      {status === "fetching" && <LiveTrackToasts latestTrack={latestTrack} tracks={recentTracks} />}
      {status === "creating" && creatingPlaylist && (
        <PlaylistCreationToast
          key={creatingPlaylist.year}
          year={creatingPlaylist.year}
          current={creatingPlaylist.current}
          total={creatingPlaylist.total}
          trackCount={creatingPlaylist.count}
          tracks={creatingPlaylist.tracks}
        />
      )}
    </div>
  );
}
