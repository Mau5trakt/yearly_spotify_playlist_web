"use client";

import type { CreatedPlaylistRecord } from "@/store/useSyncStore";
import styles from "@/styles/components/PlaylistsView.module.scss";

interface PlaylistsViewProps {
  playlists: CreatedPlaylistRecord[];
}

export function PlaylistsView({ playlists }: PlaylistsViewProps) {
  if (playlists.length === 0) return null;

  return (
    <div className={styles.playlistsSection}>
      <h2 className={styles.title}>Playlists Anuales Creadas en Spotify</h2>

      <div className={styles.playlistGrid}>
        {playlists.map((p) => (
          <div key={p.year} className={styles.playlistCard}>
            <div>
              <div className={styles.cardHeader}>
                <span className={styles.playlistYear}>{p.year}</span>
                <span className={styles.trackBadge}>{p.addedCount} temas</span>
              </div>
              <div className={styles.playlistName}>{p.name}</div>
            </div>

            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openLink}
            >
              <span>Abrir en Spotify</span>
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
