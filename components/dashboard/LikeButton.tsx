"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  meditationId: string;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({
  meditationId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
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

    // Оптимистичное обновление
    setLiked(!liked);
    setCount(liked ? Math.max(0, count - 1) : count + 1);

    try {
      const response = await fetch(`/api/meditations/${meditationId}/like`, {
        method: "POST",
      });

      if (response.status === 401) {
        setLiked(prevLiked);
        setCount(prevCount);
        window.location.href = "/login?callbackUrl=/dashboard/public";
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
        setError(data.error ?? "Не удалось поставить лайк");
        return;
      }

      setLiked(data.liked ?? prevLiked);
      setCount(data.likesCount ?? prevCount);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
      setError("Попробуйте позже");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 gap-1.5 px-2",
          liked && "text-primary hover:text-primary",
        )}
        onClick={handleClick}
        disabled={loading}
        aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
        aria-pressed={liked}
      >
        <ThumbsUp
          className={cn("h-4 w-4", liked && "fill-primary/20 text-primary")}
        />
        <span className="min-w-[1ch] text-sm tabular-nums">{count}</span>
      </Button>
      {error ? (
        <span className="max-w-[140px] text-right text-xs text-destructive">
          {error}
        </span>
      ) : null}
    </div>
  );
}
