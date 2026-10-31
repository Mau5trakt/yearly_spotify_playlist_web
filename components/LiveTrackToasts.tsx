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

const CARD_TOTAL_HEIGHT = 88; // 80px tarjeta + 8px gap

export function LiveTrackToasts({ tracks = [], latestTrack }: LiveTrackToastsProps) {
  // Inicializar estrictamente con como máximo 5 tarjetas
  const [items, setItems] = useState<ToastItem[]>(() => {
    return tracks.slice(-5).map((t, idx) => ({
      id: `${t.id}-${idx}`,
      track: t,
    }));
  });

  const trackListRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<SpotifyTrackItem[]>([]);
  const isAnimatingRef = useRef(false);

  // Procesador secuencial de la cola para evitar amontonamiento y layout shifts
  const processNextInQueue = () => {
    if (queueRef.current.length === 0 || isAnimatingRef.current) {
      return;
    }

    const nextTrack = queueRef.current.shift()!;
    const newItem: ToastItem = {
      id: `${nextTrack.id}-${Date.now()}-${Math.random()}`,
      track: nextTrack,
    };

    setItems((prev) => {
      if (prev.length < 5) {
        // Aún hay lugar: agregar y animar entrada
        setTimeout(() => {
          if (trackListRef.current) {
            const cards = trackListRef.current.children;
            const lastCard = cards[cards.length - 1];
            if (lastCard) {
              gsap.fromTo(
                lastCard,
                { opacity: 0, y: 16, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
              );
            }
          }
          processNextInQueue();
        }, 50);
        return [...prev, newItem];
      }

      // Ya hay 5 tarjetas: deslizar la cinta hacia arriba de forma continua
      isAnimatingRef.current = true;
      const nextList = [...prev, newItem]; // Temporalmente 6 para deslizar

      setTimeout(() => {
        if (trackListRef.current) {
          gsap.to(trackListRef.current, {
            y: -CARD_TOTAL_HEIGHT,
            duration: 0.32,
            ease: "power2.inOut",
            onComplete: () => {
              // 1. Remover la tarjeta superior que salió del viewport
              setItems((current) => current.slice(1));
              // 2. Resetear la posición Y instantáneamente sin salto perceptible
              if (trackListRef.current) {
                gsap.set(trackListRef.current, { y: 0 });
              }
              isAnimatingRef.current = false;
              // 3. Procesar el siguiente en cola si lo hubiera
              processNextInQueue();
            },
          });
        } else {
          isAnimatingRef.current = false;
        }
      }, 30);

      return nextList;
    });
  };

  // Listen for incoming live tracks
  useEffect(() => {
    if (!latestTrack) return;
    queueRef.current.push(latestTrack);
    processNextInQueue();
  }, [latestTrack]);

  // Handle initial static tracks (SSR or tests)
  useEffect(() => {
    if (items.length === 0 && tracks.length > 0) {
      setItems(
        tracks.slice(-5).map((t, idx) => ({
          id: `${t.id}-${idx}`,
          track: t,
        }))
      );
    }
  }, [tracks, items.length]);

  if (items.length === 0) return null;

  return (
    <div className={styles.toastsContainer} aria-live="polite">
      <div ref={trackListRef} className={styles.trackList}>
        {items.map((item) => (
          <div
            key={item.id}
            className={styles.toastCard}
            data-testid="toast-card"
          >
            {/* ALBUM COVER ON THE LEFT (64px) */}
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
              <div
                className={styles.coverPlaceholder}
                data-testid="cover-placeholder"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}

            {/* TRACK METADATA ON THE RIGHT */}
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
