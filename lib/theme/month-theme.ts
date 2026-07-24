/** Идентификаторы месячных тем (Central European climate). */
export const MONTH_THEME_IDS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

export type MonthThemeId = (typeof MONTH_THEME_IDS)[number];

/** Часовой пояс Центральной Европы (Берлин/Прага/Варшава). */
export const CENTRAL_EUROPE_TZ = "Europe/Berlin";

/** Текущий календарный месяц (1–12) в CET/CEST. */
export function getCentralEuropeanMonth(date = new Date()): number {
  const month = new Intl.DateTimeFormat("en-US", {
    timeZone: CENTRAL_EUROPE_TZ,
    month: "numeric",
  }).format(date);

  return Number(month);
}

/** data-month для `<html>` — палитра меняется с 1-го числа каждого месяца. */
export function getMonthThemeId(date = new Date()): MonthThemeId {
  const month = getCentralEuropeanMonth(date);
  return MONTH_THEME_IDS[month - 1] ?? "july";
}
