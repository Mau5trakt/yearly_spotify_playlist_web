import { describe, expect, it, beforeEach } from "bun:test";
import { useI18nStore } from "../lib/i18n";

describe("i18n Localization Engine Suite", () => {
  beforeEach(() => {
    useI18nStore.getState().setLocale("en");
  });

  it("defaults to English locale and provides English translations", () => {
    const { locale, t } = useI18nStore.getState();

    expect(locale).toBe("en");
    expect(t("common.appName")).toBe("Yearly Spotify Playlists");
    expect(t("header.logout")).toBe("Log out");
    expect(t("header.login")).toBe("Log in with Spotify");
  });

  it("switches to Spanish and translates keys accurately", () => {
    useI18nStore.getState().setLocale("es");
    const { locale, t } = useI18nStore.getState();

    expect(locale).toBe("es");
    expect(t("common.appName")).toBe("Yearly Spotify Playlists");
    expect(t("header.logout")).toBe("Cerrar sesión");
    expect(t("header.login")).toBe("Iniciar sesión con Spotify");
  });

  it("interpolates parameters in translation strings accurately", () => {
    useI18nStore.getState().setLocale("en");
    const { t } = useI18nStore.getState();

    const result = t("dashboard.welcome", { name: "Enrique" });
    expect(result).toBe("Welcome, Enrique!");

    const creatingText = t("progress.creatingStep", {
      year: 2024,
      current: 2,
      total: 5,
      count: 150,
    });
    expect(creatingText).toBe("Creating playlist for 2024 (2/5) with 150 songs...");
  });

  it("toggles between locales seamlessly", () => {
    useI18nStore.getState().setLocale("en");
    expect(useI18nStore.getState().locale).toBe("en");

    useI18nStore.getState().toggleLocale();
    expect(useI18nStore.getState().locale).toBe("es");

    useI18nStore.getState().toggleLocale();
    expect(useI18nStore.getState().locale).toBe("en");
  });

  it("falls back to raw key if path cannot be resolved", () => {
    const { t } = useI18nStore.getState();
    expect(t("non.existent.path")).toBe("non.existent.path");
  });
});
