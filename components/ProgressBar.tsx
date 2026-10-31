"use client";

import type { SpotifyTrackItem } from "@/lib/spotify";
import { LiveTrackToasts } from "./LiveTrackToasts";
import styles from "@/styles/components/ProgressBar.module.scss";

interface ProgressBarProps {
  currentAction: string;
  totalTracks: number;
  fetchedCount: number;
  status: "idle" | "fetching" | "analyzing" | "creating" | "completed" | "error";
  recentTracks?: SpotifyTrackItem[];
  latestTrack?: SpotifyTrackItem | null;
}

export function ProgressBar({
  currentAction,
  totalTracks,
  fetchedCount,
  status,
  recentTracks = [],
  latestTrack,
}: ProgressBarProps) {
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
          {fetchedCount} de {totalTracks} canciones identificadas
        </div>
      )}

      <div
        className={styles.progressBarTrack}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de sincronización"
      >
        <div
          className={styles.progressBarFill}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {status === "fetching" && (
        <LiveTrackToasts latestTrack={latestTrack} tracks={recentTracks} />
      )}
    </div>
  );
}
