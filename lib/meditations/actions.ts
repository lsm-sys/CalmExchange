"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import {
  meditationFormSchema,
  meditationIdSchema,
  type MeditationFormValues,
} from "@/lib/meditations/schemas";
import { getOwnedMeditation } from "@/lib/meditations/queries";
import { toMeditationItem, toVisibility } from "@/lib/meditations/types";

const DASHBOARD_PATHS = [
  "/dashboard",
  "/dashboard/public",
  "/dashboard/favorites",
] as const;

function revalidateDashboard() {
  for (const path of DASHBOARD_PATHS) {
    revalidatePath(path);
  }
}

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Создание медитации — только для авторизованного пользователя. */
export async function createMeditation(
  input: MeditationFormValues,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const parsed = meditationFormSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Неверные данные" };
  }

  const { title, content, isPublic } = parsed.data;
  const visibility = toVisibility(isPublic);

  const meditation = await prisma.meditation.create({
    data: {
      ownerId: session.user.id,
      title,
      content,
      visibility,
      publishedAt: isPublic ? new Date() : null,
    },
  });

  revalidateDashboard();
  return { ok: true, data: { id: meditation.id } };
}

/** Обновление — только владелец. */
export async function updateMeditation(
  id: string,
  input: MeditationFormValues,
): Promise<ActionResult> {
  const session = await requireSession();
  const idParsed = meditationIdSchema.safeParse({ id });
  const formParsed = meditationFormSchema.safeParse(input);

  if (!idParsed.success || !formParsed.success) {
    return { ok: false, error: "Неверные данные" };
  }

  const owned = await getOwnedMeditation(id, session.user.id);
  if (!owned) {
    return { ok: false, error: "Медитация не найдена или нет доступа" };
  }

  const { title, content, isPublic } = formParsed.data;
  const visibility = toVisibility(isPublic);

  await prisma.meditation.update({
    where: { id },
    data: {
      title,
      content,
      visibility,
      publishedAt:
        isPublic && !owned.publishedAt ? new Date() : owned.publishedAt,
    },
  });

  revalidateDashboard();
  return { ok: true, data: undefined };
}

/** Удаление — только владелец. */
export async function deleteMeditation(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const idParsed = meditationIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return { ok: false, error: "Неверный идентификатор" };
  }

  const owned = await getOwnedMeditation(id, session.user.id);
  if (!owned) {
    return { ok: false, error: "Медитация не найдена или нет доступа" };
  }

  await prisma.meditation.delete({ where: { id } });
  revalidateDashboard();
  return { ok: true, data: undefined };
}

/** Переключение public/private — только владелец. */
export async function togglePublic(id: string): Promise<ActionResult<{ isPublic: boolean }>> {
  const session = await requireSession();
  const idParsed = meditationIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return { ok: false, error: "Неверный идентификатор" };
  }

  const owned = await getOwnedMeditation(id, session.user.id);
  if (!owned) {
    return { ok: false, error: "Медитация не найдена или нет доступа" };
  }

  const nextPublic = owned.visibility !== "PUBLIC";
  const updated = await prisma.meditation.update({
    where: { id },
    data: {
      visibility: nextPublic ? "PUBLIC" : "PRIVATE",
      publishedAt: nextPublic && !owned.publishedAt ? new Date() : owned.publishedAt,
    },
  });

  revalidateDashboard();
  return { ok: true, data: { isPublic: updated.visibility === "PUBLIC" } };
}

/** Переключение избранного — только владелец. */
export async function toggleFavorite(
  id: string,
): Promise<ActionResult<{ isFavorite: boolean }>> {
  const session = await requireSession();
  const idParsed = meditationIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return { ok: false, error: "Неверный идентификатор" };
  }

  const owned = await getOwnedMeditation(id, session.user.id);
  if (!owned) {
    return { ok: false, error: "Медитация не найдена или нет доступа" };
  }

  const updated = await prisma.meditation.update({
    where: { id },
    data: { isFavorite: !owned.isFavorite },
  });

  revalidateDashboard();
  return {
    ok: true,
    data: { isFavorite: updated.isFavorite },
  };
}

/** Для оптимистичного UI — вернуть одну медитацию после toggle. */
export async function getMeditationItem(id: string) {
  const session = await requireSession();
  const meditation = await prisma.meditation.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  if (!meditation) {
    return null;
  }

  const isOwner = meditation.ownerId === session.user.id;
  const isPublic = meditation.visibility === "PUBLIC";

  if (!isOwner && !isPublic) {
    return null;
  }

  return toMeditationItem(meditation);
}
