import { prisma } from "@/lib/prisma";
import { Visibility, type Prisma } from "@prisma/client";
import type { ListMeditationsParams, PublicListParams } from "./schemas";
import { toMeditationItem, type PaginatedMeditations } from "./types";

function buildSearchFilter(search?: string) {
  if (!search?.trim()) {
    return undefined;
  }

  const q = search.trim();
  return {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { content: { contains: q, mode: "insensitive" as const } },
    ],
  };
}

async function paginateMeditations(
  where: Prisma.MeditationWhereInput,
  params: ListMeditationsParams,
  options?: {
    includeOwner?: boolean;
    /** Подгрузить likesCount и likedByMe для карточек */
    includeLikesForUserId?: string;
  },
): Promise<PaginatedMeditations> {
  const { page, pageSize, search } = params;
  const searchFilter = buildSearchFilter(search);
  const includeOwner = options?.includeOwner ?? false;
  const likesUserId = options?.includeLikesForUserId;

  const whereClause = searchFilter ? { AND: [where, searchFilter] } : where;

  const [total, rows] = await Promise.all([
    prisma.meditation.count({ where: whereClause }),
    prisma.meditation.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        ...(includeOwner
          ? { owner: { select: { id: true, name: true, email: true } } }
          : {}),
        ...(likesUserId
          ? {
              _count: { select: { likes: true } },
              likes: {
                where: { userId: likesUserId },
                select: { id: true },
                take: 1,
              },
            }
          : {}),
      },
    }),
  ]);

  return {
    items: rows.map(toMeditationItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Медитации текущего пользователя с пагинацией и поиском. */
export async function listMyMeditations(
  userId: string,
  params: ListMeditationsParams,
): Promise<PaginatedMeditations> {
  return paginateMeditations({ ownerId: userId }, params, {
    includeLikesForUserId: userId,
  });
}

/** Все публичные медитации с лайками и сортировкой. */
export async function listPublicMeditations(
  userId: string,
  params: PublicListParams,
): Promise<PaginatedMeditations> {
  const { page, pageSize, search, sort } = params;
  const searchFilter = buildSearchFilter(search);

  const whereClause: Prisma.MeditationWhereInput = searchFilter
    ? { AND: [{ visibility: Visibility.PUBLIC }, searchFilter] }
    : { visibility: Visibility.PUBLIC };

  const orderBy: Prisma.MeditationOrderByWithRelationInput =
    sort === "popular"
      ? { likes: { _count: "desc" } }
      : { createdAt: "desc" };

  const [total, rows] = await Promise.all([
    prisma.meditation.count({ where: whereClause }),
    prisma.meditation.findMany({
      where: whereClause,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true } },
        likes: {
          where: { userId },
          select: { id: true },
          take: 1,
        },
      },
    }),
  ]);

  return {
    items: rows.map(toMeditationItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Избранные медитации текущего пользователя. */
export async function listFavoriteMeditations(
  userId: string,
  params: ListMeditationsParams,
): Promise<PaginatedMeditations> {
  return paginateMeditations(
    { ownerId: userId, isFavorite: true },
    params,
    { includeLikesForUserId: userId },
  );
}

/** Одна медитация владельца — для проверки прав перед update/delete. */
export async function getOwnedMeditation(meditationId: string, userId: string) {
  return prisma.meditation.findFirst({
    where: { id: meditationId, ownerId: userId },
  });
}

/** Одна медитация по id (для edit dialog). */
export async function getMeditationById(meditationId: string) {
  return prisma.meditation.findUnique({ where: { id: meditationId } });
}

// --- Legacy read helpers (главная и др.) ---

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
      owner: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getMyMeditations(userId: string) {
  return prisma.meditation.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
  });
}

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
