import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Separator } from "@/components/ui/separator";

export async function SiteFooter() {
  const t = await getTranslations("layout");
  const year = new Date().getFullYear();

  const links = [
    { href: "/privacy", label: t("privacy") },
    { href: "/terms", label: t("terms") },
    { href: "/cookies", label: t("cookies") },
    { href: "/contacts", label: t("contacts") },
  ] as const;

  return (
    <footer className="mt-auto border-t border-border/80 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-muted-foreground">
          {t("copyright", { year })}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          {links.map((link, index) => (
            <span key={link.href} className="flex items-center gap-4">
              {index > 0 ? (
                <Separator orientation="vertical" className="hidden h-4 sm:inline-block" />
              ) : null}
              <Link
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
