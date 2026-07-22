import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/session";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const t = await getTranslations("common");

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar user={session.user} />
      <main className="min-w-0 flex-1 bg-white px-6 py-8 sm:px-10 sm:py-10">
        <Suspense
          fallback={
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t("loading")}
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
