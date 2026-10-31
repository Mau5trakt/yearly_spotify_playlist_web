"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { SpotifyTrackItem } from "@/lib/spotify";
import styles from "@/styles/components/LiveTrackToasts.module.scss";

interface LiveTrackToastsProps {
  tracks?: SpotifyTrackItem[];
  latestTrack?: SpotifyTrackItem | null;
}

interface ToastItem {
  id: string;
  track: SpotifyTrackItem;
}

const CARD_TOTAL_HEIGHT = 88; // 80px card + 8px gap
const EMPTY_TRACKS: SpotifyTrackItem[] = [];

export function LiveTrackToasts({
  tracks = EMPTY_TRACKS,
  latestTrack = null,
}: LiveTrackToastsProps) {
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

      const animTimer = setTimeout(() => {
        if (!trackListRef.current) {
          isAnimatingRef.current = false;
          return;
        }

        const totalItems = trackListRef.current.children.length;

        if (totalItems <= 5) {
          const lastCard = trackListRef.current.children[totalItems - 1];
          if (lastCard) {
            gsap.fromTo(
              lastCard,
              { opacity: 0, y: 16, scale: 0.96 },
              { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "power2.out" }
            );
          }
          isAnimatingRef.current = false;
          processNext();
        } else {
          gsap.to(trackListRef.current, {
            y: -CARD_TOTAL_HEIGHT,
            duration: 0.32,
            ease: "power2.inOut",
            onComplete: () => {
              setItems((current) => current.slice(1));
              if (trackListRef.current) {
                gsap.set(trackListRef.current, { y: 0 });
              }
              isAnimatingRef.current = false;
              processNext();
            },
          });
        }
      }, 40);

      return animTimer;
    };

    const timer = setTimeout(() => {
      processNext();
    }, 10);

    return () => {
      clearTimeout(timer);
    };
  }, [latestTrack]);

  if (items.length === 0) return null;

  return (
    <div className={styles.toastsContainer} aria-live="polite">
      <div ref={trackListRef} className={styles.trackList}>
        {items.map((item) => (
          <div key={item.id} className={styles.toastCard} data-testid="toast-card">
            {/* Album cover on the left (64px) */}
            {item.track.album.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.track.album.imageUrl}
                alt={item.track.name}
                className={styles.coverImage}
                data-testid="cover-image"
                width={64}
                height={64}
              />
            ) : (
              <div className={styles.coverPlaceholder} data-testid="cover-placeholder">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}

            {/* Track info on the right */}
            <div className={styles.trackInfo} data-testid="track-info">
              <span className={styles.badgeLive}>Año {item.track.year}</span>
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
