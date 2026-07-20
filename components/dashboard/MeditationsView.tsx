"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
};

const MODE_CONFIG: Record<
  MeditationsViewMode,
  {
    subtitle: string;
    emptyTitle: string;
    emptyHint: string;
    canCreate: boolean;
    showOwnerActions: boolean;
  }
> = {
  mine: {
    subtitle: "Мои медитации",
    emptyTitle: "У вас пока нет медитаций",
    emptyHint: "Создайте первую — нажмите «+ Новая медитация»",
    canCreate: true,
    showOwnerActions: true,
  },
  public: {
    subtitle: "Публичные медитации",
    emptyTitle: "Публичных медитаций пока нет",
    emptyHint: "Опубликуйте свою медитацию, чтобы она появилась здесь",
    canCreate: false,
    showOwnerActions: true,
  },
  favorites: {
    subtitle: "Избранное",
    emptyTitle: "В избранном пока пусто",
    emptyHint: "Отметьте медитацию звёздочкой в разделе «Мои медитации»",
    canCreate: false,
    showOwnerActions: true,
  },
};

export function MeditationsView({
  mode,
  currentUserId,
  initialData,
  initialSearch,
}: MeditationsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const config = MODE_CONFIG[mode];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MeditationItem | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [isNavigating, startTransition] = useTransition();

  const { items, page, totalPages, total } = initialData;

  // Debounced search → обновление URL
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
        title="Личный кабинет"
        subtitle={config.subtitle}
        actions={
          config.canCreate ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Новая медитация
            </Button>
          ) : null
        }
      />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по заголовку или тексту…"
          className="pl-9"
        />
        {isNavigating ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
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
              Новая медитация
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
            Страница {page} из {totalPages} · всего {total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isNavigating}
              onClick={() => goToPage(page - 1)}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isNavigating}
              onClick={() => goToPage(page + 1)}
            >
              Вперёд
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
