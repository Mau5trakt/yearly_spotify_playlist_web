"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { sileo } from "sileo";
import type { YearStats } from "@/lib/sync";
import type { SpotifyTrackItem } from "@/lib/spotify";
import { useTranslation } from "@/lib/i18n";
import { useSyncStore } from "@/store/useSyncStore";
import styles from "@/styles/components/StatsView.module.scss";

interface StatsViewProps {
  stats: YearStats;
}

interface EarliestToastContentProps {
  track: SpotifyTrackItem;
  badgeText: string;
  savedOnText: string;
  onClose: () => void;
}

function EarliestToastContent({
  track,
  badgeText,
  savedOnText,
  onClose,
}: EarliestToastContentProps) {
  return (
    <div className={styles.sileoCard}>
      <div className={styles.sileoHeader}>
        <span className={styles.sileoBadge}>⭐ {badgeText}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={styles.sileoCloseBtn}
          aria-label="Close notification"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      <div className={styles.sileoBody}>
        {track.album.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.album.imageUrl}
            alt={track.name}
            className={styles.sileoCover}
            width={64}
            height={64}
          />
        ) : (
          <div className={styles.sileoCoverPlaceholder}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}

        <div className={styles.sileoContent}>
          <div className={styles.sileoSongTitle} title={track.name}>
            {track.name}
          </div>
          <div className={styles.sileoSongArtist} title={track.artists.join(", ")}>
            {track.artists.join(", ")}
          </div>
          <div className={styles.sileoDate}>{savedOnText}</div>
        </div>
      </div>
    </div>
  );
}

export function StatsView({ stats }: StatsViewProps) {
  const { t } = useTranslation();
  const earliestSavedTrack = useSyncStore((state) => state.earliestSavedTrack);
  const maxCount = stats.topYear?.count || 1;
  const sectionRef = useRef<HTMLDivElement>(null);
  const toastTriggeredRef = useRef(false);

  useEffect(() => {
    if (!earliestSavedTrack || toastTriggeredRef.current) return;
    toastTriggeredRef.current = true;

    // Position on top-right for desktop and tablet; bottom-center for mobile
    const isDesktopOrTablet = typeof window !== "undefined" ? window.innerWidth >= 768 : true;
    const position = isDesktopOrTablet ? "top-right" : "bottom-center";

    const addedDate = earliestSavedTrack.addedAt
      ? new Date(earliestSavedTrack.addedAt).toLocaleDateString()
      : String(earliestSavedTrack.year);

    const savedOnText = t("earliestTrack.savedOn", { date: addedDate });
    const badgeText = t("earliestTrack.badge");

    let toastId = "";
    toastId = sileo.show({
      description: (
        <EarliestToastContent
          track={earliestSavedTrack}
          badgeText={badgeText}
          savedOnText={savedOnText}
          onClose={() => {
            if (toastId) {
              sileo.dismiss(toastId);
            } else {
              sileo.clear();
            }
          }}
        />
      ),
      duration: null, // Stays open indefinitely until dismissed via the "X" button
      position,
      fill: "#141414",
    });
  }, [earliestSavedTrack, t]);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Animate KPI cards with stagger effect
    const kpiCards = sectionRef.current.querySelectorAll(`.${styles.kpiCard}`);
    if (kpiCards.length > 0) {
      gsap.fromTo(
        kpiCards,
        { y: 24, opacity: 0, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.12, duration: 0.5, ease: "back.out(1.2)" }
      );
    }

    // Animate distribution chart progress bars
    const bars = sectionRef.current.querySelectorAll(`.${styles.barFill}`);
    if (bars.length > 0) {
      gsap.fromTo(
        bars,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, stagger: 0.06, duration: 0.65, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div ref={sectionRef} className={styles.statsSection}>
      <h2 className={styles.sectionTitle}>{t("stats.title")}</h2>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t("stats.totalTracks")}</div>
          <div className={styles.kpiValue}>{stats.totalTracks.toLocaleString()}</div>
        </div>

        <div className={`${styles.kpiCard} ${styles.highlightCard}`}>
          <div className={styles.kpiLabel}>{t("stats.topYear")}</div>
          <div className={styles.kpiValue}>
            <span className={styles.kpiCrown}>👑</span>
            {stats.topYear ? stats.topYear.year : "N/A"}
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{t("stats.timeRange")}</div>
          <div className={styles.kpiValue}>
            {stats.earliestYear && stats.latestYear
              ? `${stats.earliestYear} - ${stats.latestYear}`
              : "N/A"}
          </div>
        </div>
      </div>

      <div className={styles.chartCard}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>
          {t("stats.distributionTitle")}
        </h3>

        {stats.yearDistribution.map((item) => {
          const isTop = stats.topYear?.year === item.year;
          const barWidth = Math.max(Math.round((item.count / maxCount) * 100), 2);

          return (
            <div key={item.year} className={styles.barRow}>
              <div className={styles.yearLabel}>{item.year}</div>
              <div className={styles.barContainer}>
                <div
                  className={`${styles.barFill} ${isTop ? styles.topBar : ""}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className={styles.barCount}>
                {item.count} ({item.percentage}%)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
