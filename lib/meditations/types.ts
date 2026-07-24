import type { Meditation, Visibility } from "@prisma/client";
import type { Locale } from "@/i18n/routing";
import { isPublicVisibility } from "@/lib/utils";
import {
  resolveLocalizedContent,
  type LocalizedContent,
} from "@/lib/meditations/content-localization";

/** Публичный профиль автора (email опционален — минимизация данных). */
export type MeditationOwnerPreview = {
  id: string;
  name: string | null;
  email?: string | null;
};

/** DTO медитации для UI (visibility → isPublic). */
export type MeditationItem = {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPublic: boolean;
  isFavorite: boolean;
  sourceLocale: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: MeditationOwnerPreview;
  likesCount?: number;
  likedByMe?: boolean;
  /** Контент автоматически переведён при показе */
  autoTranslated?: boolean;
  /** Название категории (тег) */
  categoryName?: string | null;
};

export type PaginatedMeditations = {
  items: MeditationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type MeditationRow = Meditation & {
  owner?: MeditationOwnerPreview;
  category?: { category: string } | null;
  _count?: { likes: number };
  likes?: { id: string }[];
  translations?: { locale: string; title: string; content: string }[];
};

export async function toMeditationItem(
  meditation: MeditationRow,
  locale: Locale,
  allowAutoTranslate = false,
): Promise<MeditationItem> {
  const localized: LocalizedContent = await resolveLocalizedContent(
    {
      id: meditation.id,
      title: meditation.title,
      content: meditation.content,
      sourceLocale: meditation.sourceLocale,
      translations: meditation.translations ?? [],
    },
    locale,
    allowAutoTranslate,
  );

  return {
    id: meditation.id,
    userId: meditation.ownerId,
    title: localized.title,
    content: localized.content,
    isPublic: isPublicVisibility(meditation.visibility),
    isFavorite: meditation.isFavorite,
    sourceLocale: meditation.sourceLocale,
    createdAt: meditation.createdAt,
    updatedAt: meditation.updatedAt,
    owner: meditation.owner,
    autoTranslated: localized.wasAutoTranslated,
    categoryName: meditation.category?.category ?? null,
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
