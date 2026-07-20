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
};

export type PaginatedMeditations = {
  items: MeditationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function toMeditationItem(
  meditation: Meditation & { owner?: Pick<User, "id" | "name" | "email"> },
): MeditationItem {
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
  };
}

export function toVisibility(isPublic: boolean): Visibility {
  return isPublic ? "PUBLIC" : "PRIVATE";
}
