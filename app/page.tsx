"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthQuery, useLogoutMutation } from "@/hooks";
import { Header, LandingHero, Dashboard } from "@/components";
import { useTranslation } from "@/lib/i18n";
import styles from "@/styles/pages/Home.module.scss";

function PageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const authError = searchParams.get("auth_error");

  const { data: authData, isLoading, isError } = useAuthQuery();
  const logoutMutation = useLogoutMutation();

  if (isLoading && !isError) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#b3b3b3",
        }}
      >
        {t("common.loading")}
      </div>
    );
  }

  const isLoggedIn = Boolean(authData?.isLoggedIn && authData.user);

  return (
    <div className={styles.pageWrapper}>
      <Header
        user={authData?.user}
        onLogout={isLoggedIn ? () => logoutMutation.mutate() : undefined}
      />

      <main className={styles.mainContent}>
        {isLoggedIn && authData?.user ? (
          <Dashboard user={authData.user} />
        ) : (
          <LandingHero authError={authError} />
        )}
      </main>

      <footer className={styles.footer}>
        Yearly Spotify Playlists &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#b3b3b3",
          }}
        >
          Cargando Yearly Spotify Playlists...
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
}
