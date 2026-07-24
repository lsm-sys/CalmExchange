import { getTranslations } from "next-intl/server";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await requireSession();
  const t = await getTranslations("settings");
  const td = await getTranslations("dashboard");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { autoTranslateConsent: true },
  });

  return (
    <>
      <DashboardHeader title={td("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-lg space-y-6">
        <LanguageSettings />
        <PrivacySettings initialAutoTranslate={user.autoTranslateConsent} />
      </div>
    </>
  );
}
