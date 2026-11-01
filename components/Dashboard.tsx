"use client";

import { useState } from "react";
import { useSpotifySync } from "@/hooks";
import { ProgressBar, StatsView, PlaylistsView, EarliestTrackToast } from "@/components";
import { useTranslation } from "@/lib/i18n";
import styles from "@/styles/components/Dashboard.module.scss";

interface DashboardProps {
  user: {
    id: string;
    displayName: string;
    imageUrl?: string;
  };
}

export function Dashboard({ user }: DashboardProps) {
  const { t } = useTranslation();
  const [toastDismissed, setToastDismissed] = useState(false);

  const {
    status,
    totalTracks,
    fetchedCount,
    currentAction,
    stats,
    createdPlaylists,
    recentTracks,
    latestTrack,
    earliestSavedTrack,
    error,
    startSync,
    reset,
  } = useSpotifySync();

  const isWorking = status === "fetching" || status === "analyzing" || status === "creating";

  const handleReset = () => {
    setToastDismissed(false);
    reset();
  };

  const handleStartSync = () => {
    setToastDismissed(false);
    startSync();
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Earliest track toast stays open indefinitely while on completed status until X clicked or sync restarted */}
      {status === "completed" && earliestSavedTrack && !toastDismissed && (
        <EarliestTrackToast track={earliestSavedTrack} onClose={() => setToastDismissed(true)} />
      )}

      {error && (
        <div className={styles.errorBanner}>
          <p>
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={handleReset}
            style={{
              marginTop: "0.5rem",
              background: "transparent",
              color: "#fff",
              textDecoration: "underline",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t("dashboard.retryButton")}
          </button>
        </div>
      )}

      {status === "idle" && (
        <div className={styles.welcomeCard}>
          <h1 className={styles.welcomeTitle}>
            {t("dashboard.welcome", { name: user.displayName })}
          </h1>
          <p className={styles.welcomeSubtitle}>{t("dashboard.welcomeSubtitle")}</p>

          <button onClick={handleStartSync} className={styles.primaryButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>{t("dashboard.generateButton")}</span>
          </button>
        </div>
      )}

      {isWorking && (
        <ProgressBar
          status={status}
          currentAction={currentAction}
          totalTracks={totalTracks}
          fetchedCount={fetchedCount}
          recentTracks={recentTracks}
          latestTrack={latestTrack}
        />
      )}

      {status === "completed" && (
        <div>
          <div className={styles.welcomeCard}>
            <h1 className={styles.welcomeTitle} style={{ color: "#1db954" }}>
              {t("dashboard.completedTitle")}
            </h1>
            <p className={styles.welcomeSubtitle}>{t("dashboard.completedSubtitle")}</p>
            <button onClick={handleReset} className={styles.secondaryButton}>
              {t("dashboard.syncAgainButton")}
            </button>
          </div>

          {stats && <StatsView stats={stats} />}
          <PlaylistsView playlists={createdPlaylists} />
        </div>
      )}
    </div>
  );
}
