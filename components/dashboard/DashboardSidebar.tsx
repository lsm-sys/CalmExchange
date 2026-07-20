"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  History,
  LayoutGrid,
  LogOut,
  Settings,
} from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { cn, formatShortName } from "@/lib/utils";

type DashboardSidebarProps = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Медитации", icon: LayoutGrid, exact: true },
  { href: "/dashboard/favorites", label: "Избранное", icon: Bookmark },
  { href: "/dashboard/history", label: "История", icon: History },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
] as const;

function UserAvatar({
  name,
  image,
}: {
  name?: string | null;
  image?: string | null;
}) {
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className="h-14 w-14 rounded-full border-2 border-white/80 object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/80 bg-white/90 text-lg font-semibold text-[var(--sidebar-foreground)] shadow-sm">
      {initial}
    </div>
  );
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="flex w-[280px] shrink-0 flex-col border-r border-white/40 px-5 py-8"
      style={{
        background:
          "linear-gradient(165deg, var(--sidebar-from) 0%, var(--sidebar-to) 100%)",
      }}
    >
      <div className="mb-8 flex items-center gap-3">
        <UserAvatar name={user.name} image={user.image} />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-[var(--sidebar-foreground)]">
            {formatShortName(user.name)}
          </p>
          {user.email ? (
            <p className="truncate text-xs text-[var(--sidebar-foreground)]/70">
              {user.email}
            </p>
          ) : null}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, ...rest }) => {
          const exact = "exact" in rest && rest.exact;
          const isActive = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)] shadow-sm"
                  : "text-[var(--sidebar-foreground)]/80 hover:bg-white/40 hover:text-[var(--sidebar-foreground)]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        <Link
          href="/dashboard/public"
          className={cn(
            "mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/dashboard/public"
              ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)] shadow-sm"
              : "text-[var(--sidebar-foreground)]/80 hover:bg-white/40 hover:text-[var(--sidebar-foreground)]",
          )}
        >
          <LayoutGrid className="h-4 w-4 shrink-0 opacity-70" />
          Публичные
        </Link>
      </nav>

      <form action={signOutAction} className="mt-6">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--sidebar-foreground)]/80 transition-colors hover:bg-white/40 hover:text-[var(--sidebar-foreground)]"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </form>
    </aside>
  );
}
