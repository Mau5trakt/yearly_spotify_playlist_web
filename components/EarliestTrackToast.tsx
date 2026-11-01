"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { SpotifyTrackItem } from "@/lib/spotify";
import { useTranslation } from "@/lib/i18n";
import styles from "@/styles/components/EarliestTrackToast.module.scss";

interface EarliestTrackToastProps {
  track: SpotifyTrackItem;
  onClose: () => void;
}

export function EarliestTrackToast({ track, onClose }: EarliestTrackToastProps) {
  const { t } = useTranslation();
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toastRef.current) return;
    gsap.fromTo(
      toastRef.current,
      { y: -16, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }
    );
  }, []);

  const handleClose = () => {
    if (!toastRef.current) {
      onClose();
      return;
    }
    gsap.to(toastRef.current, {
      opacity: 0,
      scale: 0.95,
      y: -10,
      duration: 0.2,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  const addedDate = track.addedAt
    ? new Date(track.addedAt).toLocaleDateString()
    : String(track.year);

  return (
    <div
      ref={toastRef}
      className={styles.toastWrapper}
      role="status"
      aria-live="polite"
      data-testid="earliest-track-toast"
    >
      <div className={styles.toastHeader}>
        <div className={styles.badge}>
          <span>⭐</span>
          <span>{t("earliestTrack.badge")}</span>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className={styles.closeButton}
          aria-label="Close notification"
          data-testid="earliest-toast-close-btn"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      <div className={styles.toastBody}>
        {track.album.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.album.imageUrl}
            alt={track.name}
            className={styles.albumCover}
            data-testid="earliest-cover-image"
            width={64}
            height={64}
          />
        ) : (
          <div className={styles.coverPlaceholder} data-testid="earliest-cover-placeholder">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}

        <div className={styles.trackDetails}>
          <div className={styles.songTitle} data-testid="earliest-song-title" title={track.name}>
            {track.name}
          </div>
          <div className={styles.artistName} title={track.artists.join(", ")}>
            {track.artists.join(", ")}
          </div>
          <div className={styles.savedDate}>{t("earliestTrack.savedOn", { date: addedDate })}</div>
        </div>
      </div>
    </div>
  );
}
