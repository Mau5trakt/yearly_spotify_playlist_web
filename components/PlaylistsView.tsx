"use client";

import type { CreatedPlaylistRecord } from "@/store/useSyncStore";
import { useTranslation } from "@/lib/i18n";
import styles from "@/styles/components/PlaylistsView.module.scss";

interface PlaylistsViewProps {
  playlists: CreatedPlaylistRecord[];
}

export function PlaylistsView({ playlists }: PlaylistsViewProps) {
  const { t } = useTranslation();

  if (playlists.length === 0) return null;

  return (
    <div className={styles.playlistsSection}>
      <h2 className={styles.title}>{t("playlists.title")}</h2>

      <div className={styles.playlistGrid}>
        {playlists.map((p) => (
          <div key={p.year} className={styles.playlistCard}>
            <div>
              <div className={styles.cardHeader}>
                <span className={styles.playlistYear}>{p.year}</span>
                <span className={styles.trackBadge}>
                  {p.skippedCount && p.skippedCount > 0
                    ? p.addedCount === 0
                      ? t("playlists.upToDateBadge", { count: p.skippedCount })
                      : t("playlists.deltaBadge", {
                          added: p.addedCount,
                          skipped: p.skippedCount,
                        })
                    : t("playlists.trackBadge", { count: p.addedCount })}
                </span>
              </div>
              <div className={styles.playlistName}>{p.name}</div>
            </div>

            <a href={p.url} target="_blank" rel="noopener noreferrer" className={styles.openLink}>
              <span>{t("playlists.openInSpotify")}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 3h7v7h-2V6.414l-9.293 9.293-1.414-1.414L17.586 5H14V3zM5 5h6V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6h-2v6H5V5z" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
