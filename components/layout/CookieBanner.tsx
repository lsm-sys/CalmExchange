"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { setCookieConsent } from "@/lib/gdpr/cookie-actions";

const CONSENT_COOKIE = "COOKIE_CONSENT";

function hasConsentCookie(): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${CONSENT_COOKIE}=`));
}

export function CookieBanner() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!hasConsentCookie()) {
      setVisible(true);
    }
  }, []);

  if (!visible) {
    return null;
  }

  function accept(level: "essential" | "all") {
    startTransition(async () => {
      await setCookieConsent(level);
      setVisible(false);
    });
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border/80 bg-background/95 p-4 shadow-lg backdrop-blur sm:p-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 text-sm">
          <p className="font-medium text-foreground">{t("bannerTitle")}</p>
          <p className="text-muted-foreground">{t("bannerBody")}</p>
          <Link href="/cookies" className="text-primary hover:underline">
            {t("learnMore")}
          </Link>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => accept("essential")}
          >
            {t("essentialOnly")}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() => accept("all")}
          >
            {t("acceptAll")}
          </Button>
        </div>
      </div>
    </div>
  );
}
