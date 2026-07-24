import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PublicMeditationCard } from "@/components/home/PublicMeditationCard";
import { Button } from "@/components/ui/button";
import { getAppLocale } from "@/lib/i18n/get-locale";
import { getCurrentUserId } from "@/lib/auth/session";
import { getCatalogPublicMeditations } from "@/lib/meditations/home-queries";

export const dynamic = "force-dynamic";

type CatalogPageProps = {
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const sort = params.sort === "popular" ? "popular" : "recent";
  const userId = await getCurrentUserId();
  const locale = await getAppLocale();
  const t = await getTranslations("catalog");

  const { items, total, totalPages } = await getCatalogPublicMeditations(
    userId,
    locale,
    { page, pageSize: 20, sort },
  );

  const buildPageUrl = (p: number) => {
    const q = new URLSearchParams();
    if (sort === "popular") q.set("sort", "popular");
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  };

  const loginCallback = `/catalog${sort === "popular" ? "?sort=popular" : ""}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          asChild
          variant={sort === "recent" ? "default" : "outline"}
          size="sm"
        >
          <Link href="/catalog">{t("sortRecent")}</Link>
        </Button>
        <Button
          asChild
          variant={sort === "popular" ? "default" : "outline"}
          size="sm"
        >
          <Link href="/catalog?sort=popular">{t("sortPopular")}</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("emptyHint")}</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((meditation) => (
            <li key={meditation.id}>
              <PublicMeditationCard
                meditation={meditation}
                loginRedirectUrl={`/login?callbackUrl=${encodeURIComponent(loginCallback)}`}
              />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t("pagination", { page, totalPages, total })}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={buildPageUrl(page - 1)}>{t("back")}</Link>
              </Button>
            ) : null}
            {page < totalPages ? (
              <Button asChild variant="outline" size="sm">
                <Link href={buildPageUrl(page + 1)}>{t("forward")}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
