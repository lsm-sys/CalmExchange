import { auth } from "@/auth";
import { buildUserDataExport } from "@/lib/gdpr/user-data";
import { getTranslations } from "next-intl/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const t = await getTranslations("gdpr");

  if (!session?.user?.id) {
    return Response.json({ error: t("loginRequired") }, { status: 401 });
  }

  const data = await buildUserDataExport(session.user.id);
  const filename = `calmexchange-data-${session.user.id}.json`;

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
