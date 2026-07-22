import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Visibility } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { meditationIdSchema } from "@/lib/meditations/schemas";

export const runtime = "nodejs";

type LikeResponse = {
  liked: boolean;
  likesCount: number;
};

type ErrorResponse = {
  error: string;
};

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth();
  const t = await getTranslations("like");

  if (!session?.user?.id) {
    return Response.json(
      { error: t("loginRequired") } satisfies ErrorResponse,
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const parsed = meditationIdSchema.safeParse({ id });

  if (!parsed.success) {
    return Response.json(
      { error: t("notFound") } satisfies ErrorResponse,
      { status: 404 },
    );
  }

  const meditation = await prisma.meditation.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, visibility: true },
  });

  if (!meditation || meditation.visibility !== Visibility.PUBLIC) {
    return Response.json(
      { error: t("notFound") } satisfies ErrorResponse,
      { status: 404 },
    );
  }

  const userId = session.user.id;
  const meditationId = parsed.data.id;

  try {
    const existing = await prisma.like.findUnique({
      where: {
        userId_meditationId: { userId, meditationId },
      },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({
        data: { userId, meditationId },
      });
    }

    const likesCount = await prisma.like.count({
      where: { meditationId },
    });

    return Response.json({
      liked: !existing,
      likesCount,
    } satisfies LikeResponse);
  } catch (error) {
    console.error("[like] toggle failed:", error);
    return Response.json(
      { error: t("tryLater") } satisfies ErrorResponse,
      { status: 503 },
    );
  }
}
