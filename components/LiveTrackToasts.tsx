"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { SpotifyTrackItem } from "@/lib/spotify";
import { useTranslation } from "@/lib/i18n";
import styles from "@/styles/components/LiveTrackToasts.module.scss";

interface LiveTrackToastsProps {
  tracks?: SpotifyTrackItem[];
  latestTrack?: SpotifyTrackItem | null;
}

interface ToastItem {
  id: string;
  track: SpotifyTrackItem;
}

const EMPTY_TRACKS: SpotifyTrackItem[] = [];
const ANIM_DURATION = 0.24;

function TrackCoverImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  if (error) {
    return (
      <div className={styles.coverPlaceholder} data-testid="cover-placeholder">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={styles.coverImage}
      data-testid="cover-image"
      width={64}
      height={64}
      loading="eager"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      style={{
        width: "64px",
        height: "64px",
        objectFit: "cover",
        borderRadius: "8px",
        opacity: loaded ? 1 : 0,
      }}
    />
  );
}

export function LiveTrackToasts({
  tracks = EMPTY_TRACKS,
  latestTrack = null,
}: LiveTrackToastsProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<ToastItem[]>(() =>
    tracks.slice(-5).map((t, idx) => ({
      id: `${t.id}-${idx}`,
      track: t,
    }))
  );

  const trackListRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<SpotifyTrackItem[]>([]);
  const isAnimatingRef = useRef(false);
  const counterRef = useRef(0);

  useEffect(() => {
    if (!latestTrack) return;
    queueRef.current.push(latestTrack);

    const processNext = () => {
      if (queueRef.current.length === 0 || isAnimatingRef.current) return;
      const nextTrack = queueRef.current.shift();
      if (!nextTrack) return;

      counterRef.current += 1;
      const newItem: ToastItem = {
        id: `${nextTrack.id}-${counterRef.current}`,
        track: nextTrack,
      };

      setItems((prev) => [...prev, newItem]);
      isAnimatingRef.current = true;

      // Synchronize with next browser frame after React DOM mount
      requestAnimationFrame(() => {
        if (!trackListRef.current) {
          isAnimatingRef.current = false;
          return;
        }

        const totalItems = trackListRef.current.children.length;
        const lastCard = trackListRef.current.children[totalItems - 1] as HTMLElement | undefined;

        if (totalItems <= 5) {
          if (lastCard) {
            gsap.fromTo(
              lastCard,
              { opacity: 0, y: 14, scale: 0.98 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: ANIM_DURATION,
                ease: "power2.out",
                onComplete: () => {
                  isAnimatingRef.current = false;
                  processNext();
                },
              }
            );
          } else {
            isAnimatingRef.current = false;
            processNext();
          }
        } else {
          // More than 5 items: smoothly collapse the top card and animate the new incoming card
          const firstCard = trackListRef.current.children[0] as HTMLElement | undefined;

          if (lastCard) {
            gsap.fromTo(
              lastCard,
              { opacity: 0, y: 14, scale: 0.98 },
              { opacity: 1, y: 0, scale: 1, duration: ANIM_DURATION, ease: "power2.out" }
            );
          }

          if (firstCard) {
            gsap.to(firstCard, {
              height: 0,
              opacity: 0,
              paddingTop: 0,
              paddingBottom: 0,
              marginBottom: 0,
              borderTopWidth: 0,
              borderBottomWidth: 0,
              duration: ANIM_DURATION,
              ease: "power2.inOut",
              onComplete: () => {
                // Once the top card is 0px tall, borders zeroed and fully transparent,
                // removing it from state produces 0 layout shift or flicker.
                setItems((current) => current.slice(1));
                isAnimatingRef.current = false;
                processNext();
              },
            });
          } else {
            setItems((current) => current.slice(1));
            isAnimatingRef.current = false;
            processNext();
          }
        }
      });
    };

    processNext();
  }, [latestTrack]);

  if (items.length === 0) return null;

  return (
    <div className={styles.toastsContainer} aria-live="polite">
      <div ref={trackListRef} className={styles.trackList}>
        {items.map((item) => (
          <div key={item.id} className={styles.toastCard} data-testid="toast-card">
            {/* Album cover wrapper strictly bounded to 64x64 on the left */}
            <div className={styles.coverWrapper}>
              {item.track.album.imageUrl ? (
                <TrackCoverImage src={item.track.album.imageUrl} alt={item.track.name} />
              ) : (
                <div className={styles.coverPlaceholder} data-testid="cover-placeholder">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Track info on the right */}
            <div className={styles.trackInfo} data-testid="track-info">
              <span className={styles.badgeLive}>
                {t("toasts.yearBadge", { year: item.track.year })}
              </span>
              <div className={styles.trackName} title={item.track.name}>
                {item.track.name}
              </div>
              <div className={styles.trackArtist} title={item.track.artists.join(", ")}>
                {item.track.artists.join(", ")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
