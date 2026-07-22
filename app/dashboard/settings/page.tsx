import { getTranslations } from "next-intl/server";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LanguageSettings } from "@/components/settings/LanguageSettings";

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const td = await getTranslations("dashboard");

  return (
    <>
      <DashboardHeader title={td("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-lg space-y-6">
        <LanguageSettings />
        <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
          <p className="text-lg font-medium">{t("comingSoonTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("comingSoonDescription")}
          </p>
        </div>
      </div>
    </>
  );
}
