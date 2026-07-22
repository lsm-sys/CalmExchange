"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Globe,
  Lock,
  MessageSquare,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  deleteMeditation,
  toggleFavorite,
  togglePublic,
} from "@/lib/meditations/actions";
import type { MeditationItem } from "@/lib/meditations/types";
import { cn, meditationPreview } from "@/lib/utils";
import { LikeButton } from "@/components/dashboard/LikeButton";

type MeditationCardProps = {
  meditation: MeditationItem;
  currentUserId: string;
  onEdit: (meditation: MeditationItem) => void;
  onMutate?: () => void;
  showOwnerActions?: boolean;
};

export function MeditationCard({
  meditation,
  currentUserId,
  onEdit,
  onMutate,
  showOwnerActions = true,
}: MeditationCardProps) {
  const t = useTranslations("meditationCard");
  const tc = useTranslations("common");
  const isOwner = meditation.userId === currentUserId;
  const canManage = isOwner && showOwnerActions;
  const canLike =
    meditation.isPublic && meditation.likesCount !== undefined;
  const [isFavorite, setIsFavorite] = useState(meditation.isFavorite);
  const [isPublic, setIsPublic] = useState(meditation.isPublic);
  const [isPending, startTransition] = useTransition();

  function handleToggleFavorite() {
    const prev = isFavorite;
    setIsFavorite(!prev);
    startTransition(async () => {
      const result = await toggleFavorite(meditation.id);
      if (!result.ok) {
        setIsFavorite(prev);
        return;
      }
      setIsFavorite(result.data.isFavorite);
      onMutate?.();
    });
  }

  function handleTogglePublic() {
    const prev = isPublic;
    setIsPublic(!prev);
    startTransition(async () => {
      const result = await togglePublic(meditation.id);
      if (!result.ok) {
        setIsPublic(prev);
        return;
      }
      setIsPublic(result.data.isPublic);
      onMutate?.();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMeditation(meditation.id);
      if (result.ok) {
        onMutate?.();
      }
    });
  }

  return (
    <Card className="flex items-start gap-4 border-border/80 p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/80 text-primary">
        <MessageSquare className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">
              {meditation.title}
            </h3>
            {!isOwner && meditation.owner?.name ? (
              <p className="text-xs text-muted-foreground">
                {meditation.owner.name}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {canManage ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleToggleFavorite}
                disabled={isPending}
                aria-label={
                  isFavorite ? t("removeFavorite") : t("addFavorite")
                }
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    isFavorite
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground",
                  )}
                />
              </Button>
            ) : null}

            {canManage ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(meditation)}
                  aria-label={t("edit")}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleTogglePublic}
                  disabled={isPending}
                  aria-label={isPublic ? t("makePrivate") : t("makePublic")}
                >
                  {isPublic ? (
                    <Globe className="h-4 w-4 text-primary" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label={t("delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("deleteDescription", { title: meditation.title })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t("delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : null}
          </div>
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {meditationPreview(meditation.content)}
        </p>

        {canLike ? (
          <div className="mt-3 flex items-center border-t border-border/60 pt-3">
            <LikeButton
              meditationId={meditation.id}
              initialLiked={meditation.likedByMe ?? false}
              initialCount={meditation.likesCount ?? 0}
            />
            <span className="ml-2 text-xs text-muted-foreground">
              {meditation.likedByMe ? t("liked") : t("likePrompt")}
            </span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
