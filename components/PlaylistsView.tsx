"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { CreatedPlaylistRecord } from "@/store/useSyncStore";
import { useTranslation } from "@/lib/i18n";
import styles from "@/styles/components/PlaylistsView.module.scss";

interface PlaylistsViewProps {
  playlists: CreatedPlaylistRecord[];
}

interface AnimatedCoverGridProps {
  covers: string[];
}

function AnimatedCoverGrid({ covers }: AnimatedCoverGridProps) {
  const [quadrantImages, setQuadrantImages] = useState<string[]>(() => [
    covers[0],
    covers[1],
    covers[2],
    covers[3],
  ]);

  const quadrantRefs = useRef<Array<HTMLDivElement | null>>([null, null, null, null]);
  const stepRef = useRef<number>(0);
  const poolIndexRef = useRef<number>(4);

  useEffect(() => {
    if (covers.length < 4) return;

    const interval = setInterval(() => {
      const qIndex = stepRef.current % 4;
      stepRef.current += 1;

      const nextUrl = covers[poolIndexRef.current % covers.length];
      poolIndexRef.current += 1;

      setQuadrantImages((prev) => {
        const next = [...prev];
        next[qIndex] = nextUrl;
        return next;
      });

      requestAnimationFrame(() => {
        const cell = quadrantRefs.current[qIndex];
        if (!cell) return;

        const img = cell.querySelector("img");
        if (!img) return;

        switch (qIndex) {
          case 0: // Top-Left: bottom to top
            gsap.fromTo(
              img,
              { yPercent: 100, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
            );
            break;
          case 1: // Top-Right: left to right
            gsap.fromTo(
              img,
              { xPercent: -100, opacity: 0 },
              { xPercent: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
            );
            break;
          case 2: // Bottom-Right: top to bottom
            gsap.fromTo(
              img,
              { yPercent: -100, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
            );
            break;
          case 3: // Bottom-Left: left to right
            gsap.fromTo(
              img,
              { xPercent: -100, opacity: 0 },
              { xPercent: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
            );
            break;
        }
      });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [covers]);

  return (
    <div className={styles.coverGrid2x2} data-testid="cover-grid-2x2">
      {quadrantImages.map((url, idx) => (
        <div
          key={idx}
          ref={(el) => {
            quadrantRefs.current[idx] = el;
          }}
          className={styles.coverQuadrant}
          data-testid={`summary-quadrant-${idx}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className={styles.gridCoverImage} loading="lazy" />
        </div>
      ))}
    </div>
  );
}

export function PlaylistsView({ playlists }: PlaylistsViewProps) {
  const { t } = useTranslation();

  if (playlists.length === 0) return null;

  return (
    <div className={styles.playlistsSection}>
      <h2 className={styles.title}>{t("playlists.title")}</h2>

      <div className={styles.playlistGrid}>
        {playlists.map((p) => {
          const covers = p.coverImages || [];

          return (
            <div key={p.year} className={styles.playlistCard} data-testid="playlist-summary-card">
              {/* Cover Artwork header on top of the card: animated 2x2 grid if >= 4 covers, or single cover if < 4 */}
              <div className={styles.cardCoverWrapper} data-testid="card-cover-wrapper">
                {covers.length >= 4 ? (
                  <AnimatedCoverGrid covers={covers} />
                ) : covers.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={covers[0]}
                    alt={p.name}
                    className={styles.singleCardCover}
                    data-testid="single-card-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.coverPlaceholder} data-testid="cover-placeholder">
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Card textual and button content */}
              <div className={styles.cardContent}>
                <div>
                  <div className={styles.cardHeader}>
                    <span className={styles.playlistYear}>{p.year}</span>
                    <span className={styles.trackBadge}>
                      {p.skippedCount && p.skippedCount > 0
                        ? p.addedCount === 0
                          ? t("playlists.upToDateBadge", {
                              count: p.skippedCount,
                            })
                          : t("playlists.deltaBadge", {
                              added: p.addedCount,
                              skipped: p.skippedCount,
                            })
                        : t("playlists.trackBadge", { count: p.addedCount })}
                    </span>
                  </div>
                  <div className={styles.playlistName}>{p.name}</div>
                </div>

                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.openLink}
                >
                  <span>{t("playlists.openInSpotify")}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 3h7v7h-2V6.414l-9.293 9.293-1.414-1.414L17.586 5H14V3zM5 5h6V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6h-2v6H5V5z" />
                  </svg>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
