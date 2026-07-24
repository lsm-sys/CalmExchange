import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { MeditationListSection } from "@/components/home/MeditationListSection";
import { Button } from "@/components/ui/button";
import { getAppLocale } from "@/lib/i18n/get-locale";
import { getHomePublicMeditations } from "@/lib/meditations/home-queries";
import { getCurrentUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const userId = await getCurrentUserId();
  const locale = await getAppLocale();
  const t = await getTranslations("home");

  const { recent, popular } = await getHomePublicMeditations(userId, locale);

  const addHref = session?.user ? "/dashboard" : "/login?callbackUrl=/dashboard";

  return (
    <>
      <section className="border-b border-border/60 bg-gradient-to-b from-accent/40 to-background">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl space-y-5">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              CalmExchange
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="text-lg text-muted-foreground">{t("heroSubtitle")}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Button asChild size="lg">
                <Link href={addHref}>{t("addMeditation")}</Link>
              </Button>
              {!session?.user ? (
                <p className="text-sm text-muted-foreground">{t("signInHint")}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
        <MeditationListSection
          title={t("recentTitle")}
          subtitle={t("recentSubtitle")}
          items={recent}
          emptyTitle={t("recentEmptyTitle")}
          emptyHint={t("recentEmptyHint")}
          viewAllHref="/catalog"
          viewAllLabel={t("viewAll")}
        />

        <MeditationListSection
          title={t("popularTitle")}
          subtitle={t("popularSubtitle")}
          items={popular}
          emptyTitle={t("popularEmptyTitle")}
          emptyHint={t("popularEmptyHint")}
          viewAllHref="/catalog?sort=popular"
          viewAllLabel={t("viewAll")}
        />
      </div>
    </>
  );
}
