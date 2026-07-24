import Link from "next/link";
import { PublicMeditationCard } from "@/components/home/PublicMeditationCard";
import type { MeditationItem } from "@/lib/meditations/types";

type MeditationListSectionProps = {
  title: string;
  subtitle?: string;
  items: MeditationItem[];
  emptyTitle: string;
  emptyHint: string;
  viewAllHref?: string;
  viewAllLabel?: string;
};

export function MeditationListSection({
  title,
  subtitle,
  items,
  emptyTitle,
  emptyHint,
  viewAllHref,
  viewAllLabel,
}: MeditationListSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {viewAllHref && viewAllLabel ? (
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-primary hover:underline"
          >
            {viewAllLabel}
          </Link>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
          <p className="font-medium text-foreground">{emptyTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">{emptyHint}</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((meditation) => (
            <li key={meditation.id}>
              <PublicMeditationCard meditation={meditation} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
