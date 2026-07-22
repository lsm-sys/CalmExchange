"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { localeLabels, locales, type Locale } from "@/i18n/routing";
import { setLocale } from "@/lib/i18n/actions";
import { cn } from "@/lib/utils";

export function LanguageSettings() {
  const t = useTranslations("settings");
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  function handleSelect(locale: Locale) {
    if (locale === currentLocale || isPending) {
      return;
    }

    startTransition(async () => {
      await setLocale(locale);
      window.location.reload();
    });
  }

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{t("language")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("languageDescription")}
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {locales.map((locale) => {
          const isActive = locale === currentLocale;

          return (
            <li key={locale}>
              <button
                type="button"
                onClick={() => handleSelect(locale)}
                disabled={isPending}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  isActive
                    ? "border-primary/40 bg-primary/5 text-foreground"
                    : "border-border hover:bg-muted/50",
                  isPending && "opacity-60",
                )}
              >
                <span className="font-medium">{localeLabels[locale]}</span>
                {isActive ? (
                  <Check className="h-4 w-4 text-primary" aria-hidden />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
