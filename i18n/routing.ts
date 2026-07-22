import { defineRouting } from "next-intl/routing";

/** Поддерживаемые локали. Добавьте новый код сюда и файл messages/{code}.json */
export const locales = ["ru", "en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

export const localeLabels: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
  fr: "Français",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  /** URL без префикса /en, /fr — локаль хранится в cookie */
  localePrefix: "never",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});
