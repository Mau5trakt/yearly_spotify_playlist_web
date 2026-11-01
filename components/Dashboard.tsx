"use client";

import { useSpotifySync } from "@/hooks";
import { ProgressBar, StatsView, PlaylistsView } from "@/components";
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
  const {
    status,
    totalTracks,
    fetchedCount,
    currentAction,
    stats,
    createdPlaylists,
    recentTracks,
    latestTrack,
    error,
    startSync,
    reset,
  } = useSpotifySync();

  const isWorking = status === "fetching" || status === "analyzing" || status === "creating";

  return (
    <div className={styles.dashboardContainer}>
      {error && (
        <div className={styles.errorBanner}>
          <p>
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={reset}
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

          <button onClick={startSync} className={styles.primaryButton}>
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
            <button onClick={reset} className={styles.secondaryButton}>
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
