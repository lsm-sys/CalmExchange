"use client";

import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowRight, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LikeButton } from "@/components/dashboard/LikeButton";
import type { MeditationItem } from "@/lib/meditations/types";
import { meditationPreview } from "@/lib/utils";

type PublicMeditationCardProps = {
  meditation: MeditationItem;
  loginRedirectUrl?: string;
};

export function PublicMeditationCard({
  meditation,
  loginRedirectUrl = "/login",
}: PublicMeditationCardProps) {
  const t = useTranslations("home");
  const format = useFormatter();

  return (
    <Card className="flex h-full flex-col gap-4 p-5 transition-shadow hover:shadow-md">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-start gap-2">
          <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug text-foreground">
            {meditation.title}
          </h3>
          {meditation.autoTranslated ? (
            <Badge variant="outline" className="shrink-0 gap-1">
              <Globe className="h-3 w-3" />
              {t("autoTranslated")}
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {meditation.owner?.name ? (
            <span>{meditation.owner.name}</span>
          ) : null}
          {meditation.owner?.name ? <span aria-hidden>·</span> : null}
          <time dateTime={meditation.createdAt.toISOString()}>
            {format.dateTime(meditation.createdAt, { dateStyle: "medium" })}
          </time>
        </div>

        {meditation.categoryName ? (
          <Badge variant="secondary">{meditation.categoryName}</Badge>
        ) : null}

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {meditationPreview(meditation.content)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <LikeButton
          meditationId={meditation.id}
          initialLiked={meditation.likedByMe ?? false}
          initialCount={meditation.likesCount ?? 0}
          loginRedirectUrl={loginRedirectUrl}
        />
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href={`/meditations/${meditation.id}`}>
            {t("open")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
