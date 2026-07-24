import { prisma } from "@/lib/prisma";
import { Visibility } from "@prisma/client";
import type { Locale } from "@/i18n/routing";
import { toMeditationItem, type MeditationItem } from "./types";

const HOME_LIMIT = 12;

const publicInclude = {
  translations: {
    select: { locale: true, title: true, content: true },
  },
  owner: { select: { id: true, name: true } },
  category: { select: { category: true } },
  _count: { select: { likes: true } },
} as const;

type MeditationRow = Awaited<
  ReturnType<
    typeof prisma.meditation.findMany<{
      include: typeof publicInclude;
    }>
  >
>[number];

async function attachLikedByMe(
  rows: MeditationRow[],
  userId: string | null,
  locale: Locale,
): Promise<MeditationItem[]> {
  let likedIds = new Set<string>();

  if (userId && rows.length > 0) {
    const likes = await prisma.like.findMany({
      where: {
        userId,
        meditationId: { in: rows.map((r) => r.id) },
      },
      select: { meditationId: true },
    });
    likedIds = new Set(likes.map((l) => l.meditationId));
  }

  return Promise.all(
    rows.map(async (row) => {
      const item = await toMeditationItem(
        {
          ...row,
          likes: likedIds.has(row.id) ? [{ id: "liked" }] : [],
        },
        locale,
      );
      return item;
    }),
  );
}

export type HomeMeditationsData = {
  recent: MeditationItem[];
  popular: MeditationItem[];
};

/** Две выборки публичных медитаций для главной: новые и популярные. */
export async function getHomePublicMeditations(
  userId: string | null,
  locale: Locale,
  limit = HOME_LIMIT,
): Promise<HomeMeditationsData> {
  const where = { visibility: Visibility.PUBLIC };

  const [recentRows, popularRows] = await Promise.all([
    prisma.meditation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: publicInclude,
    }),
    prisma.meditation.findMany({
      where,
      orderBy: { likes: { _count: "desc" } },
      take: limit,
      include: publicInclude,
    }),
  ]);

  const [recent, popular] = await Promise.all([
    attachLikedByMe(recentRows, userId, locale),
    attachLikedByMe(popularRows, userId, locale),
  ]);

  return { recent, popular };
}

export type PublicMeditationDetail = MeditationItem & {
  categoryName?: string | null;
};

/** Публичная медитация для страницы просмотра (без email владельца). */
export async function getPublicMeditationDetail(
  meditationId: string,
  userId: string | null,
  locale: Locale,
): Promise<PublicMeditationDetail | null> {
  const row = await prisma.meditation.findFirst({
    where: { id: meditationId, visibility: Visibility.PUBLIC },
    include: publicInclude,
  });

  if (!row) {
    return null;
  }

  let likedByMe = false;
  if (userId) {
    const like = await prisma.like.findUnique({
      where: {
        userId_meditationId: { userId, meditationId },
      },
    });
    likedByMe = Boolean(like);
  }

  const item = await toMeditationItem(
    {
      ...row,
      likes: likedByMe ? [{ id: "liked" }] : [],
    },
    locale,
  );

  return {
    ...item,
    categoryName: row.category?.category ?? null,
  };
}

export type CatalogPageData = {
  items: MeditationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Пагинированный каталог публичных медитаций. */
export async function getCatalogPublicMeditations(
  userId: string | null,
  locale: Locale,
  options: {
    page?: number;
    pageSize?: number;
    sort?: "recent" | "popular";
  } = {},
): Promise<CatalogPageData> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? 20;
  const sort = options.sort ?? "recent";
  const where = { visibility: Visibility.PUBLIC };

  const orderBy =
    sort === "popular"
      ? ({ likes: { _count: "desc" } } as const)
      : ({ createdAt: "desc" } as const);

  const [total, rows] = await Promise.all([
    prisma.meditation.count({ where }),
    prisma.meditation.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: publicInclude,
    }),
  ]);

  const items = await attachLikedByMe(rows, userId, locale);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
