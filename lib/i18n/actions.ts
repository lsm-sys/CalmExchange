"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales, type Locale } from "@/i18n/routing";

/** Сохранить выбранный язык в cookie и обновить UI. */
export async function setLocale(locale: Locale) {
  if (!locales.includes(locale)) {
    return { ok: false as const };
  }

  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/public");
  revalidatePath("/dashboard/favorites");
  return { ok: true as const };
}
