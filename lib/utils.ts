import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Превью текста медитации — до 2 строк (~120 символов). */
export function meditationPreview(content: string, maxLength = 120): string {
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

/** Короткое имя для сайдбара: «Антон Л.» */
export function formatShortName(
  name: string | null | undefined,
  fallback = "User",
): string {
  if (!name?.trim()) {
    return fallback;
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0];
  }

  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? "";
  return `${first} ${lastInitial}.`;
}

/** visibility ↔ isPublic для API и UI. */
export function isPublicVisibility(visibility: "PUBLIC" | "PRIVATE"): boolean {
  return visibility === "PUBLIC";
}
