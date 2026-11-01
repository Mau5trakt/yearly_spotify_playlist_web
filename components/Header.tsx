"use client";

import { useTranslation } from "@/lib/i18n";
import styles from "@/styles/components/Header.module.scss";

interface HeaderProps {
  user?: {
    id: string;
    displayName: string;
    imageUrl?: string;
  } | null;
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const { locale, setLocale, t } = useTranslation();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <svg
          className={styles.logoIcon}
          viewBox="0 0 24 24"
          width="32"
          height="32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.216.353-.674.468-1.027.252-2.812-1.718-6.352-2.107-10.523-1.154-.403.092-.806-.157-.899-.56-.092-.403.157-.806.56-.899 4.568-1.044 8.49-.604 11.637 1.334.353.216.468.674.252 1.027zm1.468-3.26c-.272.443-.852.585-1.295.313-3.22-1.979-8.128-2.551-11.936-1.394-.499.151-1.03-.134-1.182-.633-.151-.499.134-1.03.633-1.182 4.356-1.322 9.774-.683 13.467 1.59.443.272.585.852.313 1.295zm.126-3.41c-3.86-2.292-10.228-2.503-13.896-1.389-.59.18-1.218-.154-1.398-.745-.18-.59.154-1.218.745-1.398 4.215-1.28 11.246-1.038 15.698 1.605.53.314.704 1.002.39 1.532-.314.53-1.002.704-1.532.395z" />
        </svg>
        <span>{t("common.appName")}</span>
      </div>

      <div className={styles.actionsSection}>
        <div className={styles.langSwitcher} aria-label={t("header.switchLanguage")}>
          <button
            type="button"
            className={`${styles.langOption} ${locale === "en" ? styles.active : ""}`}
            onClick={() => setLocale("en")}
            aria-pressed={locale === "en"}
          >
            EN
          </button>
          <button
            type="button"
            className={`${styles.langOption} ${locale === "es" ? styles.active : ""}`}
            onClick={() => setLocale("es")}
            aria-pressed={locale === "es"}
          >
            ES
          </button>
        </div>

        {user && (
          <div className={styles.userSection}>
            <div className={styles.userBadge}>
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.imageUrl} alt={user.displayName} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className={styles.userName}>{user.displayName}</span>
            </div>

            {onLogout && (
              <button onClick={onLogout} className={styles.logoutBtn} type="button">
                {t("header.logout")}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
