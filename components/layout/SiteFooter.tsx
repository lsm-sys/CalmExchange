import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Separator } from "@/components/ui/separator";

export async function SiteFooter() {
  const t = await getTranslations("layout");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/80 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-muted-foreground">
          {t("copyright", { year })}
        </p>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/privacy"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("privacy")}
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <Link
            href="/contacts"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("contacts")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
