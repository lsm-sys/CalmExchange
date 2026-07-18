import { listTables } from "@/lib/view-db/repository";
import { getDbFromRequest, handleApiError } from "@/lib/view-db/api";

export async function GET(request: Request) {
  const { db, error } = getDbFromRequest(request);
  if (error) {
    return error;
  }

  try {
    const tables = await listTables(db!);
    return Response.json({ tables });
  } catch (err) {
    return handleApiError(err);
  }
}
