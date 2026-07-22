import {
  listPublicMeditations,
  publicListSchema,
} from "@/lib/meditations";
import { requireSession } from "@/lib/auth/session";
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

  const data = await listPublicMeditations(session.user.id, listParams);

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
