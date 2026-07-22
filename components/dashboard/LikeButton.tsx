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
        aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
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
