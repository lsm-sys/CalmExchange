import { getLocale } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";

/** Текущая локаль UI из cookie (server). */
export async function getAppLocale(): Promise<Locale> {
  const locale = await getLocale();
  return locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;
}
