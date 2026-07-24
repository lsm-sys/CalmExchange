import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const COOKIE_CONSENT_NAME = "COOKIE_CONSENT";
export const AUTO_TRANSLATE_COOKIE = "AUTO_TRANSLATE";

export type CookieConsentLevel = "essential" | "all";

/** Согласие на cookie-баннер (essential | all). */
export async function getCookieConsentLevel(): Promise<CookieConsentLevel | null> {
  const store = await cookies();
  const value = store.get(COOKIE_CONSENT_NAME)?.value;
  return value === "essential" || value === "all" ? value : null;
}

/**
 * Можно ли отправлять текст медитаций стороннему API перевода (MyMemory).
 * — авторизованный: флаг в БД;
 * — гость: cookie AUTO_TRANSLATE=1 при consent=all.
 */
export async function canAutoTranslate(userId: string | null): Promise<boolean> {
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { autoTranslateConsent: true },
    });
    return user?.autoTranslateConsent ?? false;
  }

  const store = await cookies();
  const consent = store.get(COOKIE_CONSENT_NAME)?.value;
  if (consent !== "all") {
    return false;
  }

  return store.get(AUTO_TRANSLATE_COOKIE)?.value === "1";
}
