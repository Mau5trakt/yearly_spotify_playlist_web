import { create } from "zustand";
import { en } from "./en";
import { es } from "./es";
import type { Locale, Translations } from "./types";

const dictionaries: Record<Locale, Translations> = { en, es };

function getInitialLocale(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("preferred_locale") as Locale | null;
    if (saved === "en" || saved === "es") return saved;
  }
  return "en";
}

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

export const useI18nStore = create<I18nStore>((set, get) => ({
  locale: getInitialLocale(),
  setLocale: (locale: Locale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_locale", locale);
    }
    set({ locale });
  },
  toggleLocale: () => {
    const next: Locale = get().locale === "en" ? "es" : "en";
    get().setLocale(next);
  },
  t: (path: string, params?: Record<string, string | number>): string => {
    const { locale } = get();
    const dict = dictionaries[locale] || dictionaries.en;
    const parts = path.split(".");
    let current: unknown = dict;

    for (const part of parts) {
      if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        // Fallback to English dictionary if not found in current locale
        let fallback: unknown = dictionaries.en;
        for (const fPart of parts) {
          if (
            fallback &&
            typeof fallback === "object" &&
            fPart in (fallback as Record<string, unknown>)
          ) {
            fallback = (fallback as Record<string, unknown>)[fPart];
          } else {
            return path;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== "string") {
      return path;
    }

    if (!params) return current;

    return Object.entries(params).reduce((acc, [key, val]) => {
      return acc.replaceAll(`{${key}}`, String(val));
    }, current);
  },
}));

export function useTranslation() {
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  const toggleLocale = useI18nStore((s) => s.toggleLocale);
  const t = useI18nStore((s) => s.t);
  return { locale, setLocale, toggleLocale, t };
}
