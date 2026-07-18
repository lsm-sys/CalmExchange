import {
  createRow,
  deleteRow,
  getTableMeta,
  getTableRows,
  updateRow,
} from "@/lib/view-db/repository";
import {
  getDbFromRequest,
  getPagination,
  handleApiError,
} from "@/lib/view-db/api";

type RouteContext = {
  params: Promise<{ table: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { db, error } = getDbFromRequest(request);
  if (error) {
    return error;
  }

  const { table } = await context.params;
  const decodedTable = decodeURIComponent(table);
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");

  try {
    if (mode === "meta") {
      const meta = await getTableMeta(db!, decodedTable);
      return Response.json({ meta });
    }

    const { page, pageSize } = getPagination(request);
    const data = await getTableRows(db!, decodedTable, page, pageSize);
    return Response.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { db, error } = getDbFromRequest(request);
  if (error) {
    return error;
  }

  const { table } = await context.params;
  const decodedTable = decodeURIComponent(table);

  try {
    const body = (await request.json()) as { data?: Record<string, unknown> };
    if (!body.data) {
      return Response.json({ error: "Поле data обязательно." }, { status: 400 });
    }

    const row = await createRow(db!, decodedTable, body.data);
    return Response.json({ row });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { db, error } = getDbFromRequest(request);
  if (error) {
    return error;
  }

  const { table } = await context.params;
  const decodedTable = decodeURIComponent(table);

  try {
    const body = (await request.json()) as {
      primaryKey?: Record<string, unknown>;
      data?: Record<string, unknown>;
    };

    if (!body.primaryKey || !body.data) {
      return Response.json(
        { error: "Поля primaryKey и data обязательны." },
        { status: 400 },
      );
    }

    const row = await updateRow(db!, decodedTable, body.primaryKey, body.data);
    return Response.json({ row });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { db, error } = getDbFromRequest(request);
  if (error) {
    return error;
  }

  const { table } = await context.params;
  const decodedTable = decodeURIComponent(table);

  try {
    const body = (await request.json()) as {
      primaryKey?: Record<string, unknown>;
    };

    if (!body.primaryKey) {
      return Response.json({ error: "Поле primaryKey обязательно." }, { status: 400 });
    }

    await deleteRow(db!, decodedTable, body.primaryKey);
    return Response.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
