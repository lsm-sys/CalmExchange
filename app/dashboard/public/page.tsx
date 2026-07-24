import {
  listPublicMeditations,
  publicListSchema,
} from "@/lib/meditations";
import { requireSession } from "@/lib/auth/session";
import { getAppLocale } from "@/lib/i18n/get-locale";
import { MeditationsView } from "@/components/dashboard/MeditationsView";

type PublicPageProps = {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
};

export default async function PublicMeditationsPage({
  searchParams,
}: PublicPageProps) {
  const session = await requireSession();
  const params = await searchParams;

  const listParams = publicListSchema.parse({
    page: params.page,
    search: params.q,
    sort: params.sort,
  });

  const locale = await getAppLocale();
  const data = await listPublicMeditations(session.user.id, listParams, locale);

  return (
    <MeditationsView
      mode="public"
      currentUserId={session.user.id}
      initialData={data}
      initialSearch={params.q ?? ""}
      initialSort={listParams.sort}
    />
  );
}
