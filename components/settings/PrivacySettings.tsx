"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  deleteAccount,
  setAutoTranslateConsent,
} from "@/lib/gdpr/actions";

type PrivacySettingsProps = {
  initialAutoTranslate: boolean;
};

export function PrivacySettings({
  initialAutoTranslate,
}: PrivacySettingsProps) {
  const t = useTranslations("gdpr");
  const [autoTranslate, setAutoTranslate] = useState(initialAutoTranslate);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAutoTranslateChange(checked: boolean) {
    setAutoTranslate(checked);
    startTransition(async () => {
      const result = await setAutoTranslateConsent(checked);
      if (!result.ok) {
        setAutoTranslate(!checked);
        setMessage(t("saveFailed"));
        return;
      }
      setMessage(checked ? t("autoTranslateOn") : t("autoTranslateOff"));
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccount();
      if (!result.ok) {
        setMessage(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">{t("dataTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("dataDescription")}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <a href="/api/gdpr/export" download>
            {t("exportButton")}
          </a>
        </Button>
      </section>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{t("autoTranslateTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("autoTranslateDescription")}{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                {t("privacyLink")}
              </Link>
            </p>
          </div>
          <Switch
            checked={autoTranslate}
            onCheckedChange={handleAutoTranslateChange}
            disabled={pending}
            aria-label={t("autoTranslateTitle")}
          />
        </div>
      </section>

      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="text-lg font-semibold text-destructive">{t("deleteTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("deleteDescription")}</p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="mt-4" disabled={pending}>
              {t("deleteButton")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("deleteConfirmDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("deleteConfirmAction")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
