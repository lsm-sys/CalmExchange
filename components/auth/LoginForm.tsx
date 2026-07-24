"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

type LoginFormProps = {
  signInAction: () => Promise<void>;
};

export function LoginForm({ signInAction }: LoginFormProps) {
  const t = useTranslations("auth");
  const [consent, setConsent] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent || pending) {
      return;
    }
    startTransition(async () => {
      await signInAction();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex items-start gap-3 text-left text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-border"
        />
        <span>
          {t("consentPrefix")}{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            {t("privacyLink")}
          </Link>{" "}
          {t("consentAnd")}{" "}
          <Link href="/terms" className="text-primary hover:underline">
            {t("termsLink")}
          </Link>
          . {t("consentSuffix")}
        </span>
      </label>

      <button
        type="submit"
        disabled={!consent || pending}
        className="auth-btn auth-btn-google w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? t("signingIn") : t("signInGoogle")}
      </button>
    </form>
  );
}
