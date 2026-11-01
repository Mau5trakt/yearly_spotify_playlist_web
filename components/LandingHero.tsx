"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import styles from "@/styles/components/LandingHero.module.scss";

interface LandingHeroProps {
  authError?: string | null;
}

export function LandingHero({ authError }: LandingHeroProps) {
  const { t } = useTranslation();

  return (
    <section className={styles.heroSection}>
      <div className={styles.badge}>
        <span>{t("hero.badge")}</span>
      </div>

      <h1 className={styles.title}>
        {t("hero.title")} <span className={styles.highlight}>{t("hero.titleHighlight")}</span>
      </h1>

      <p className={styles.description}>{t("hero.subtitle")}</p>

      {authError && (
        <div className={styles.errorNotice}>{t("hero.authError", { error: authError })}</div>
      )}

      <div className={styles.ctaWrapper}>
        <Link href="/api/auth/login" className={styles.ctaButton}>
          <svg
            className={styles.btnIcon}
            viewBox="0 0 24 24"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.216.353-.674.468-1.027.252-2.812-1.718-6.352-2.107-10.523-1.154-.403.092-.806-.157-.899-.56-.092-.403.157-.806.56-.899 4.568-1.044 8.49-.604 11.637 1.334.353.216.468.674.252 1.027zm1.468-3.26c-.272.443-.852.585-1.295.313-3.22-1.979-8.128-2.551-11.936-1.394-.499.151-1.03-.134-1.182-.633-.151-.499.134-1.03.633-1.182 4.356-1.322 9.774-.683 13.467 1.59.443.272.585.852.313 1.295zm.126-3.41c-3.86-2.292-10.228-2.503-13.896-1.389-.59.18-1.218-.154-1.398-.745-.18-.59.154-1.218.745-1.398 4.215-1.28 11.246-1.038 15.698 1.605.53.314.704 1.002.39 1.532-.314.53-1.002.704-1.532.395z" />
          </svg>
          <span>{t("hero.cta")}</span>
        </Link>
      </div>

      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <div className={styles.cardNumber}>1</div>
          <h3 className={styles.cardTitle}>{t("hero.step1Title")}</h3>
          <p className={styles.cardText}>{t("hero.step1Desc")}</p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.cardNumber}>2</div>
          <h3 className={styles.cardTitle}>{t("hero.step2Title")}</h3>
          <p className={styles.cardText}>{t("hero.step2Desc")}</p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.cardNumber}>3</div>
          <h3 className={styles.cardTitle}>{t("hero.step3Title")}</h3>
          <p className={styles.cardText}>{t("hero.step3Desc")}</p>
        </div>
      </div>
    </section>
  );
}
