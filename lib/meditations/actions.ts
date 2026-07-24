"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { getAppLocale } from "@/lib/i18n/get-locale";
import {
  upsertMeditationTranslation,
} from "@/lib/meditations/content-localization";
import {
  meditationFormSchema,
  meditationIdSchema,
  validationMessageKey,
  type MeditationFormValues,
} from "@/lib/meditations/schemas";
import { getOwnedMeditation } from "@/lib/meditations/queries";
import { toMeditationItem, toVisibility } from "@/lib/meditations/types";
import { translateMeditationContent } from "@/lib/translation/translate-text";
import type { Locale } from "@/i18n/routing";
import { locales } from "@/i18n/routing";

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

async function translateValidationError(error: z.ZodError): Promise<string> {
  const t = await getTranslations("validation");
  const tErrors = await getTranslations("errors");
  const issue = error.issues[0];
  const field = String(issue?.path[0] ?? "");
  const key = validationMessageKey(field, issue?.code ?? "");
  if (key) {
    return t(key);
  }
  return tErrors("invalidData");
}

/** После сохранения — фоново перевести на остальные языки. */
async function syncOtherLocales(
  meditationId: string,
  sourceLocale: Locale,
  title: string,
  content: string,
) {
  const others = locales.filter((l) => l !== sourceLocale);

  await Promise.all(
    others.map(async (target) => {
      const translated = await translateMeditationContent(
        title,
        content,
        sourceLocale,
        target,
      );
      await upsertMeditationTranslation(
        meditationId,
        target,
        translated.title,
        translated.content,
      );
    }),
  );
}

export async function createMeditation(
  input: MeditationFormValues,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const locale = await getAppLocale();
  const parsed = meditationFormSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: await translateValidationError(parsed.error) };
  }

  const { title, content, isPublic } = parsed.data;
  const visibility = toVisibility(isPublic);

  const meditation = await prisma.meditation.create({
    data: {
      ownerId: session.user.id,
      title,
      content,
      sourceLocale: locale,
      visibility,
      publishedAt: isPublic ? new Date() : null,
    },
  });

  await upsertMeditationTranslation(meditation.id, locale, title, content);
  await syncOtherLocales(meditation.id, locale, title, content);

  revalidateDashboard();
  return { ok: true, data: { id: meditation.id } };
}

export async function updateMeditation(
  id: string,
  input: MeditationFormValues,
): Promise<ActionResult> {
  const session = await requireSession();
  const locale = await getAppLocale();
  const t = await getTranslations("errors");
  const idParsed = meditationIdSchema.safeParse({ id });
  const formParsed = meditationFormSchema.safeParse(input);

  if (!idParsed.success || !formParsed.success) {
    if (!formParsed.success) {
      return { ok: false, error: await translateValidationError(formParsed.error) };
    }
    return { ok: false, error: t("invalidData") };
  }

  const owned = await getOwnedMeditation(id, session.user.id);
  if (!owned) {
    return { ok: false, error: t("notFoundOrForbidden") };
  }

  const { title, content, isPublic } = formParsed.data;
  const visibility = toVisibility(isPublic);
  const sourceLocale = owned.sourceLocale as Locale;

  const updateMain =
    locale === sourceLocale
      ? { title, content }
      : {};

  await prisma.meditation.update({
    where: { id },
    data: {
      ...updateMain,
      visibility,
      publishedAt:
        isPublic && !owned.publishedAt ? new Date() : owned.publishedAt,
    },
  });

  await upsertMeditationTranslation(id, locale, title, content);

  if (locale === sourceLocale) {
    await syncOtherLocales(id, sourceLocale, title, content);
  }

  revalidateDashboard();
  return { ok: true, data: undefined };
}

export async function deleteMeditation(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const t = await getTranslations("errors");
  const idParsed = meditationIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return { ok: false, error: t("invalidId") };
  }

  const owned = await getOwnedMeditation(id, session.user.id);
  if (!owned) {
    return { ok: false, error: t("notFoundOrForbidden") };
  }

  await prisma.meditation.delete({ where: { id } });
  revalidateDashboard();
  return { ok: true, data: undefined };
}

export async function togglePublic(
  id: string,
): Promise<ActionResult<{ isPublic: boolean }>> {
  const session = await requireSession();
  const t = await getTranslations("errors");
  const idParsed = meditationIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return { ok: false, error: t("invalidId") };
  }

  const owned = await getOwnedMeditation(id, session.user.id);
  if (!owned) {
    return { ok: false, error: t("notFoundOrForbidden") };
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

export async function toggleFavorite(
  id: string,
): Promise<ActionResult<{ isFavorite: boolean }>> {
  const session = await requireSession();
  const t = await getTranslations("errors");
  const idParsed = meditationIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return { ok: false, error: t("invalidId") };
  }

  const owned = await getOwnedMeditation(id, session.user.id);
  if (!owned) {
    return { ok: false, error: t("notFoundOrForbidden") };
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

export async function getMeditationItem(id: string) {
  const session = await requireSession();
  const locale = await getAppLocale();
  const meditation = await prisma.meditation.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      translations: {
        select: { locale: true, title: true, content: true },
      },
      _count: { select: { likes: true } },
      likes: {
        where: { userId: session.user.id },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!meditation) {
    return null;
  }

  const isOwner = meditation.ownerId === session.user.id;
  const isPublic = meditation.visibility === "PUBLIC";

  if (!isOwner && !isPublic) {
    return null;
  }

  return toMeditationItem(meditation, locale);
}
