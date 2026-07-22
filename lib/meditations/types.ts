import type { Meditation, User, Visibility } from "@prisma/client";
import { isPublicVisibility } from "@/lib/utils";

/** DTO медитации для UI (visibility → isPublic). */
export type MeditationItem = {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner?: Pick<User, "id" | "name" | "email">;
  /** Количество лайков (только для публичного списка). */
  likesCount?: number;
  /** Лайкнул ли текущий пользователь (только для публичного списка). */
  likedByMe?: boolean;
};

export type PaginatedMeditations = {
  items: MeditationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type MeditationRow = Meditation & {
  owner?: Pick<User, "id" | "name" | "email">;
  _count?: { likes: number };
  likes?: { id: string }[];
};

export function toMeditationItem(meditation: MeditationRow): MeditationItem {
  return {
    id: meditation.id,
    userId: meditation.ownerId,
    title: meditation.title,
    content: meditation.content,
    isPublic: isPublicVisibility(meditation.visibility),
    isFavorite: meditation.isFavorite,
    createdAt: meditation.createdAt,
    updatedAt: meditation.updatedAt,
    owner: meditation.owner,
    ...(meditation._count !== undefined
      ? {
          likesCount: meditation._count.likes,
          likedByMe: (meditation.likes?.length ?? 0) > 0,
        }
      : {}),
  };
}

export function toVisibility(isPublic: boolean): Visibility {
  return isPublic ? "PUBLIC" : "PRIVATE";
}
