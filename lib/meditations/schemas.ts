import { z } from "zod";

export const meditationFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Укажите заголовок")
    .max(200, "Максимум 200 символов"),
  content: z
    .string()
    .trim()
    .min(1, "Укажите текст медитации")
    .max(10000, "Максимум 10000 символов"),
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

/** Параметры списка публичных медитаций (+ сортировка). */
export const publicListSchema = listMeditationsSchema.extend({
  sort: z
    .enum(["popular", "recent"])
    .catch("recent")
    .default("recent"),
});

export type PublicListParams = z.infer<typeof publicListSchema>;
