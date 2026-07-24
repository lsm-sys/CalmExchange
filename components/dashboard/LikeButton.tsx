"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  meditationId: string;
  initialLiked: boolean;
  initialCount: number;
  /** Куда перенаправить при 401 (гость ставит лайк) */
  loginRedirectUrl?: string;
};

export function LikeButton({
  meditationId,
  initialLiked,
  initialCount,
  loginRedirectUrl = "/login?callbackUrl=/",
}: LikeButtonProps) {
  const t = useTranslations("like");
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);

    const prevLiked = liked;
    const prevCount = count;

    setLiked(!liked);
    setCount(liked ? Math.max(0, count - 1) : count + 1);

    try {
      const response = await fetch(`/api/meditations/${meditationId}/like`, {
        method: "POST",
      });

      if (response.status === 401) {
        setLiked(prevLiked);
        setCount(prevCount);
        window.location.href = loginRedirectUrl;
        return;
      }

      const data = (await response.json()) as {
        liked?: boolean;
        likesCount?: number;
        error?: string;
      };

      if (!response.ok) {
        setLiked(prevLiked);
        setCount(prevCount);
        setError(data.error ?? t("failed"));
        return;
      }

      setLiked(data.liked ?? prevLiked);
      setCount(data.likesCount ?? prevCount);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
      setError(t("tryLater"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant={liked ? "secondary" : "outline"}
        size="sm"
        className={cn(
          "h-9 gap-2 px-3",
          liked && "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
        )}
        onClick={handleClick}
        disabled={loading}
        aria-label={liked ? t("remove") : t("add")}
        aria-pressed={liked}
      >
        <ThumbsUp
          className={cn("h-4 w-4", liked && "fill-primary text-primary")}
        />
        <span className="text-sm font-medium tabular-nums">{count}</span>
      </Button>
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : null}
    </div>
  );
}
