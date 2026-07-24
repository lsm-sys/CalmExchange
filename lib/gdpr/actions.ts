"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { signOut } from "@/auth";
import { requireSession } from "@/lib/auth/session";
import { deleteUserAccount } from "@/lib/gdpr/user-data";
import { prisma } from "@/lib/prisma";

export type GdprActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function setAutoTranslateConsent(
  enabled: boolean,
): Promise<GdprActionResult> {
  const session = await requireSession();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      autoTranslateConsent: enabled,
      autoTranslateConsentAt: enabled ? new Date() : null,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteAccount(): Promise<GdprActionResult> {
  const session = await requireSession();
  const t = await getTranslations("gdpr");

  try {
    await deleteUserAccount(session.user.id);
    await signOut({ redirectTo: "/" });
    return { ok: true };
  } catch {
    return { ok: false, error: t("deleteFailed") };
  }
}
