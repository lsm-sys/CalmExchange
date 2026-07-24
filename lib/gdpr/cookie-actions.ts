"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  AUTO_TRANSLATE_COOKIE,
  COOKIE_CONSENT_NAME,
  type CookieConsentLevel,
} from "@/lib/gdpr/consent";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setCookieConsent(level: CookieConsentLevel) {
  const store = await cookies();
  store.set(COOKIE_CONSENT_NAME, level, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });

  if (level === "all") {
    store.set(AUTO_TRANSLATE_COOKIE, "1", {
      path: "/",
      maxAge: ONE_YEAR,
      sameSite: "lax",
    });
  } else {
    store.delete(AUTO_TRANSLATE_COOKIE);
  }

  revalidatePath("/", "layout");
  return { ok: true as const };
}
