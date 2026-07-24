import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { ArrowLeft, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LikeButton } from "@/components/dashboard/LikeButton";
import { getAppLocale } from "@/lib/i18n/get-locale";
import { getCurrentUserId } from "@/lib/auth/session";
import { getPublicMeditationDetail } from "@/lib/meditations/home-queries";

export const dynamic = "force-dynamic";

type MeditationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MeditationPage({ params }: MeditationPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const locale = await getAppLocale();
  const t = await getTranslations("meditationPage");
  const format = await getFormatter();

  const meditation = await getPublicMeditationDetail(id, userId, locale);

  if (!meditation) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6 gap-1.5">
        <Link href="/catalog">
          <ArrowLeft className="h-4 w-4" />
          {t("backToCatalog")}
        </Link>
      </Button>

      <header className="space-y-4">
        <div className="flex flex-wrap items-start gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{meditation.title}</h1>
          {meditation.autoTranslated ? (
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              {t("autoTranslated")}
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {meditation.owner?.name ? <span>{meditation.owner.name}</span> : null}
          {meditation.owner?.name ? <span aria-hidden>·</span> : null}
          <time dateTime={meditation.createdAt.toISOString()}>
            {format.dateTime(meditation.createdAt, {
              dateStyle: "long",
            })}
          </time>
        </div>

        {meditation.categoryName ? (
          <Badge variant="secondary">{meditation.categoryName}</Badge>
        ) : null}
      </header>

      <Separator className="my-8" />

      <div className="prose prose-neutral max-w-none whitespace-pre-wrap text-base leading-relaxed text-foreground">
        {meditation.content}
      </div>

      <Separator className="my-8" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <LikeButton
          meditationId={meditation.id}
          initialLiked={meditation.likedByMe ?? false}
          initialCount={meditation.likesCount ?? 0}
          loginRedirectUrl={`/login?callbackUrl=${encodeURIComponent(`/meditations/${id}`)}`}
        />
        <p className="text-sm text-muted-foreground">{t("readOnlyHint")}</p>
      </div>
    </article>
  );
}
