import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";

export type MeditationFormValues = {
  title: string;
  content: string;
  isPublic: boolean;
};

/** Zod-схема формы с переведёнными сообщениями (client). */
export function useMeditationFormSchema() {
  const t = useTranslations("validation");

  return useMemo(
    () =>
      z.object({
        title: z
          .string()
          .trim()
          .min(1, t("titleRequired"))
          .max(200, t("titleMax")),
        content: z
          .string()
          .trim()
          .min(1, t("contentRequired"))
          .max(10000, t("contentMax")),
        isPublic: z.boolean(),
      }),
    [t],
  );
}
