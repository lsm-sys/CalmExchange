import { prisma } from "@/lib/prisma";
import { Visibility } from "@prisma/client";

/**
 * Публичные медитации — видны всем.
 * Приватные — только владельцу (ownerId === userId).
 */
export async function getVisibleMeditations(userId: string | null) {
  return prisma.meditation.findMany({
    where: {
      OR: [
        { visibility: Visibility.PUBLIC },
        ...(userId ? [{ ownerId: userId }] : []),
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

/** Медитации текущего пользователя (личный кабинет). */
export async function getMyMeditations(userId: string) {
  return prisma.meditation.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Одна медитация с проверкой доступа.
 * PRIVATE доступна только владельцу.
 */
export async function getMeditationIfAllowed(
  meditationId: string,
  userId: string | null,
) {
  const meditation = await prisma.meditation.findUnique({
    where: { id: meditationId },
  });

  if (!meditation) {
    return null;
  }

  const isOwner = userId !== null && meditation.ownerId === userId;
  const isPublic = meditation.visibility === Visibility.PUBLIC;

  if (!isPublic && !isOwner) {
    return null;
  }

  return meditation;
}
