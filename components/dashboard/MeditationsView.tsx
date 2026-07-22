"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MeditationCard } from "@/components/dashboard/MeditationCard";
import { MeditationDialog } from "@/components/dashboard/MeditationDialog";
import type {
  MeditationItem,
  PaginatedMeditations,
} from "@/lib/meditations/types";

export type MeditationsViewMode = "mine" | "public" | "favorites";

type MeditationsViewProps = {
  mode: MeditationsViewMode;
  currentUserId: string;
  initialData: PaginatedMeditations;
  initialSearch: string;
  initialSort?: "popular" | "recent";
};

export function MeditationsView({
  mode,
  currentUserId,
  initialData,
  initialSearch,
  initialSort = "recent",
}: MeditationsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("dashboard");
  const tm = useTranslations("meditations");

  const modeConfig = useMemo(
    () => ({
      mine: {
        subtitle: tm("mine.subtitle"),
        emptyTitle: tm("mine.emptyTitle"),
        emptyHint: tm("mine.emptyHint"),
        canCreate: true,
        showOwnerActions: true,
      },
      public: {
        subtitle: tm("public.subtitle"),
        emptyTitle: tm("public.emptyTitle"),
        emptyHint: tm("public.emptyHint"),
        canCreate: false,
        showOwnerActions: true,
      },
      favorites: {
        subtitle: tm("favorites.subtitle"),
        emptyTitle: tm("favorites.emptyTitle"),
        emptyHint: tm("favorites.emptyHint"),
        canCreate: false,
        showOwnerActions: true,
      },
    }),
    [tm],
  );

  const config = modeConfig[mode];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MeditationItem | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<"popular" | "recent">(initialSort);
  const [isNavigating, startTransition] = useTransition();

  const { items, page, totalPages, total } = initialData;

  useEffect(() => {
    if (mode !== "public") {
      return;
    }
    const urlSort =
      searchParams.get("sort") === "popular" ? "popular" : "recent";
    setSort(urlSort);
  }, [searchParams, mode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const currentQ = params.get("q") ?? "";

      if (search.trim() === currentQ.trim()) {
        return;
      }

      if (search.trim()) {
        params.set("q", search.trim());
      } else {
        params.delete("q");
      }
      params.delete("page");

      startTransition(() => {
        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [search, pathname, router, searchParams]);

  useEffect(() => {
    if (mode !== "public") {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    const currentSort = params.get("sort") === "popular" ? "popular" : "recent";

    if (sort === currentSort) {
      return;
    }

    if (sort === "recent") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    params.delete("page");

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }, [sort, mode, pathname, router, searchParams]);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(meditation: MeditationItem) {
    setEditing(meditation);
    setDialogOpen(true);
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <>
      <DashboardHeader
        title={t("title")}
        subtitle={config.subtitle}
        actions={
          config.canCreate ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t("newMeditation")}
            </Button>
          ) : null
        }
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
          />
          {isNavigating ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}
        </div>

        {mode === "public" ? (
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant={sort === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSort("recent")}
              disabled={isNavigating}
            >
              {t("sortRecent")}
            </Button>
            <Button
              type="button"
              variant={sort === "popular" ? "default" : "outline"}
              size="sm"
              onClick={() => setSort("popular")}
              disabled={isNavigating}
            >
              {t("sortPopular")}
            </Button>
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center">
          <p className="text-lg font-medium text-foreground">
            {config.emptyTitle}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{config.emptyHint}</p>
          {config.canCreate ? (
            <Button className="mt-6" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t("newMeditation")}
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((meditation) => (
            <li key={meditation.id}>
              <MeditationCard
                meditation={meditation}
                currentUserId={currentUserId}
                onEdit={openEdit}
                onMutate={handleRefresh}
                showOwnerActions={config.showOwnerActions}
              />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
          <span>
            {t("pagination", { page, totalPages, total })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isNavigating}
              onClick={() => goToPage(page - 1)}
            >
              {t("back")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isNavigating}
              onClick={() => goToPage(page + 1)}
            >
              {t("forward")}
            </Button>
          </div>
        </div>
      ) : null}

      <MeditationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        meditation={editing}
        onSuccess={handleRefresh}
      />
    </>
  );
}
