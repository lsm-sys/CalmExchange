import {
  listMeditationsSchema,
  listPublicMeditations,
} from "@/lib/meditations";
import { requireSession } from "@/lib/auth/session";
import { MeditationsView } from "@/components/dashboard/MeditationsView";

type PublicPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function PublicMeditationsPage({
  searchParams,
}: PublicPageProps) {
  const session = await requireSession();
  const params = await searchParams;

  const listParams = listMeditationsSchema.parse({
    page: params.page,
    search: params.q,
  });

  const data = await listPublicMeditations(listParams);

  return (
    <MeditationsView
      mode="public"
      currentUserId={session.user.id}
      initialData={data}
      initialSearch={params.q ?? ""}
    />
  );
}
