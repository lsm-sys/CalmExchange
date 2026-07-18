import { NextResponse } from "next/server";
import { parseDbTarget } from "@/lib/view-db/types";

export function getDbFromRequest(request: Request) {
  const url = new URL(request.url);
  const db = parseDbTarget(url.searchParams.get("db"));

  if (!db) {
    return {
      error: NextResponse.json(
        { error: "Укажите параметр db=local или db=work." },
        { status: 400 },
      ),
    };
  }

  return { db };
}

export function handleApiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Неизвестная ошибка.";
  return NextResponse.json({ error: message }, { status: 400 });
}

export function getPagination(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("pageSize") ?? "10") || 10),
  );

  return { page, pageSize };
}
