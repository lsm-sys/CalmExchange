import { getTranslations } from "next-intl/server";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function HistoryPage() {
  const t = await getTranslations("history");
  const td = await getTranslations("dashboard");

  return (
    <>
      <DashboardHeader title={td("title")} subtitle={t("subtitle")} />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-20 text-center">
        <p className="text-lg font-medium">{t("comingSoonTitle")}</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {t("comingSoonDescription")}
        </p>
      </div>
    </>
  );
}
