"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import { formatShortName } from "@/lib/utils";

type UserMenuProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations("layout");
  const tc = useTranslations("common");
  const displayName = formatShortName(user.name, tc("user"));

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-8 w-8 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </span>
        )}
        <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
          {displayName}
        </span>
      </Link>

      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm" className="gap-1.5">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t("signOut")}</span>
        </Button>
      </form>
    </div>
  );
}
