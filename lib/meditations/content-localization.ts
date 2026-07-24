import { prisma } from "@/lib/prisma";
import type { Locale } from "@/i18n/routing";
import { translateMeditationContent } from "@/lib/translation/translate-text";

type MeditationWithTranslations = {
  id: string;
  title: string;
  content: string;
  sourceLocale: string;
  translations: {
    locale: string;
    title: string;
    content: string;
  }[];
};

export type LocalizedContent = {
  title: string;
  content: string;
  /** true — показан автоперевод, сохранён в БД */
  wasAutoTranslated: boolean;
};

/**
 * Возвращает title/content на targetLocale.
 * Если перевода нет — автоперевод из sourceLocale и сохранение в MeditationTranslation.
 */
export async function resolveLocalizedContent(
  meditation: MeditationWithTranslations,
  targetLocale: Locale,
): Promise<LocalizedContent> {
  const sourceLocale = meditation.sourceLocale as Locale;

  if (targetLocale === sourceLocale) {
    return {
      title: meditation.title,
      content: meditation.content,
      wasAutoTranslated: false,
    };
  }

  const cached = meditation.translations.find((t) => t.locale === targetLocale);
  if (cached) {
    return {
      title: cached.title,
      content: cached.content,
      wasAutoTranslated: false,
    };
  }

  const translated = await translateMeditationContent(
    meditation.title,
    meditation.content,
    sourceLocale,
    targetLocale,
  );

  await prisma.meditationTranslation.upsert({
    where: {
      meditationId_locale: {
        meditationId: meditation.id,
        locale: targetLocale,
      },
    },
    create: {
      meditationId: meditation.id,
      locale: targetLocale,
      title: translated.title,
      content: translated.content,
    },
    update: {
      title: translated.title,
      content: translated.content,
    },
  });

  return {
    title: translated.title,
    content: translated.content,
    wasAutoTranslated: true,
  };
}

/** Сохранить/обновить перевод для локали (при создании/редактировании). */
export async function upsertMeditationTranslation(
  meditationId: string,
  locale: Locale,
  title: string,
  content: string,
) {
  await prisma.meditationTranslation.upsert({
    where: {
      meditationId_locale: { meditationId, locale },
    },
    create: { meditationId, locale, title, content },
    update: { title, content },
  });
}
