"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { YearStats } from "@/lib/sync";
import { useTranslation } from "@/lib/i18n";
import styles from "@/styles/components/StatsView.module.scss";

interface StatsViewProps {
  stats: YearStats;
}

export function StatsView({ stats }: StatsViewProps) {
  const { t } = useTranslation();
  const maxCount = stats.topYear?.count || 1;
  const sectionRef = useRef<HTMLDivElement>(null);

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
