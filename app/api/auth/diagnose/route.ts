import { handlers } from "@/auth";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const response = await handlers.GET(request);
    const location = response.headers.get("Location");
    const text = await response.clone().text();

    return Response.json({
      status: response.status,
      location,
      preview: text.slice(0, 200),
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
