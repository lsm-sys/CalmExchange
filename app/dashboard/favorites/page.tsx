import {
  listFavoriteMeditations,
  listMeditationsSchema,
} from "@/lib/meditations";
import { requireSession } from "@/lib/auth/session";
import { MeditationsView } from "@/components/dashboard/MeditationsView";

type FavoritesPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function FavoritesPage({ searchParams }: FavoritesPageProps) {
  const session = await requireSession();
  const params = await searchParams;

  const listParams = listMeditationsSchema.parse({
    page: params.page,
    search: params.q,
  });

  const data = await listFavoriteMeditations(session.user.id, listParams);

  return (
    <MeditationsView
      mode="favorites"
      currentUserId={session.user.id}
      initialData={data}
      initialSearch={params.q ?? ""}
    />
  );
}
