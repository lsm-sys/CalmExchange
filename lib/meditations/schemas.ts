import { z } from "zod";

/** Серверная схема без UI-сообщений (ошибки переводятся через getTranslations). */
export const meditationFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(10000),
  isPublic: z.boolean(),
});

export type MeditationFormValues = z.infer<typeof meditationFormSchema>;

export const meditationIdSchema = z.object({
  id: z.string().cuid(),
});

export const listMeditationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(200).optional(),
});

export type ListMeditationsParams = z.infer<typeof listMeditationsSchema>;

export const publicListSchema = listMeditationsSchema.extend({
  sort: z.enum(["popular", "recent"]).catch("recent").default("recent"),
});

export type PublicListParams = z.infer<typeof publicListSchema>;

/** Маппинг полей Zod → ключи validation.* */
export function validationMessageKey(
  field: string,
  code: string,
): "titleRequired" | "titleMax" | "contentRequired" | "contentMax" | null {
  if (field === "title" && code === "too_small") return "titleRequired";
  if (field === "title" && code === "too_big") return "titleMax";
  if (field === "content" && code === "too_small") return "contentRequired";
  if (field === "content" && code === "too_big") return "contentMax";
  return null;
}
