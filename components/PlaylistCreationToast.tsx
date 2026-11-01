"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import type { SpotifyTrackItem } from "@/lib/spotify";
import { useTranslation } from "@/lib/i18n";
import styles from "@/styles/components/PlaylistCreationToast.module.scss";

interface PlaylistCreationToastProps {
  year: number;
  current: number;
  total: number;
  trackCount: number;
  tracks: SpotifyTrackItem[];
}

export function PlaylistCreationToast({
  year,
  current,
  total,
  trackCount,
  tracks,
}: PlaylistCreationToastProps) {
  const { t } = useTranslation();

  // Extract all non-empty album covers for this specific playlist
  const imagePool = useMemo(() => {
    const urls = tracks
      .map((t) => t.album.imageUrl)
      .filter((url): url is string => typeof url === "string" && url.trim().length > 0);
    return Array.from(new Set(urls));
  }, [tracks]);

  // Initial 4 quadrant images
  const [quadrantImages, setQuadrantImages] = useState<Array<string | null>>(() => [
    imagePool[0] || null,
    imagePool[1] || null,
    imagePool[2] || null,
    imagePool[3] || null,
  ]);

  const quadrantRefs = useRef<Array<HTMLDivElement | null>>([null, null, null, null]);

  const yearRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<number>(0);
  const poolIndexRef = useRef<number>(4);

  // Initial mount animation for the title (from bottom to top with opacity)
  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  // Dedicated animation for the year whenever it changes
  useEffect(() => {
    if (yearRef.current) {
      gsap.fromTo(
        yearRef.current,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [year]);

  // Rotate images every 500ms following the 4-quadrant directional sequence (only if >= 4 images)
  useEffect(() => {
    if (imagePool.length < 4) return;

    const interval = setInterval(() => {
      const qIndex = stepRef.current % 4;
      stepRef.current += 1;

      // Pick next image from pool
      const nextUrl = imagePool[poolIndexRef.current % imagePool.length] || imagePool[0];
      poolIndexRef.current += 1;

      // Update state for this quadrant
      setQuadrantImages((prev) => {
        const next = [...prev];
        next[qIndex] = nextUrl;
        return next;
      });

      // Wait for next animation frame so DOM contains the newly mounted image
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
  }, [imagePool]);

  return (
    <div
      className={styles.playlistToast}
      role="status"
      aria-live="polite"
      data-testid="playlist-creation-toast"
    >
      {/* Collage or Single Cover on the left */}
      {imagePool.length >= 4 ? (
        <div className={styles.collageWrapper} data-testid="collage-grid">
          {quadrantImages.map((src, i) => (
            <div
              key={i}
              ref={(el) => {
                quadrantRefs.current[i] = el;
              }}
              className={styles.quadrant}
              data-testid={`quadrant-${i}`}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt=""
                  className={styles.quadrantImage}
                  width={40}
                  height={40}
                  loading="eager"
                />
              ) : (
                <div className={styles.quadrantPlaceholder} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.singleCoverWrapper} data-testid="single-cover-grid">
          {imagePool.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePool[0]}
              alt=""
              className={styles.singleCoverImage}
              width={80}
              height={80}
              loading="eager"
            />
          ) : (
            <div className={styles.singleCoverPlaceholder}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Info Section on the right */}
      <div className={styles.infoSection}>
        <div className={styles.badgeCreating}>
          <span className={styles.pulseDot} />
          <span>
            {t("creationToast.creating")} ({current}/{total})
          </span>
        </div>

        <div ref={titleRef} className={styles.titleWrapper}>
          <span>Liked</span>
          <span ref={yearRef} className={styles.yearSpan} data-testid="creation-year">
            {year}
          </span>
        </div>

        <div className={styles.metaText}>
          <span className={styles.trackPill}>
            {t("creationToast.tracksCount", { count: trackCount })}
          </span>
          <span>{t("creationToast.progressIndicator", { current, total })}</span>
        </div>
      </div>
    </div>
  );
}
