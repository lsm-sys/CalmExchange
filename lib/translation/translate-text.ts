import type { Locale } from "@/i18n/routing";

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

/** Маппинг локалей приложения → коды API перевода. */
const LOCALE_CODES: Record<Locale, string> = {
  ru: "ru",
  en: "en",
  fr: "fr",
};

/**
 * Перевод одной строки через MyMemory (бесплатный tier, без ключа).
 * При ошибке возвращает исходный текст.
 */
export async function translateText(
  text: string,
  from: Locale,
  to: Locale,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || from === to) {
    return text;
  }

  const langpair = `${LOCALE_CODES[from]}|${LOCALE_CODES[to]}`;

  try {
    const url = new URL(MYMEMORY_URL);
    url.searchParams.set("q", trimmed.slice(0, 450));
    url.searchParams.set("langpair", langpair);

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(12_000),
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return text;
    }

    const data = (await response.json()) as {
      responseData?: { translatedText?: string };
    };

    const translated = data.responseData?.translatedText?.trim();
    if (!translated || translated.toUpperCase().includes("QUERY LENGTH")) {
      return text;
    }

    return translated;
  } catch {
    return text;
  }
}

/** Перевод title + content медитации. */
export async function translateMeditationContent(
  title: string,
  content: string,
  from: Locale,
  to: Locale,
): Promise<{ title: string; content: string }> {
  if (from === to) {
    return { title, content };
  }

  const [translatedTitle, translatedContent] = await Promise.all([
    translateText(title, from, to),
    translateLongText(content, from, to),
  ]);

  return { title: translatedTitle, content: translatedContent };
}

/** Длинный текст — по абзацам (лимит API ~500 символов на запрос). */
async function translateLongText(
  text: string,
  from: Locale,
  to: Locale,
): Promise<string> {
  const paragraphs = text.split(/\n+/);
  const chunks: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      chunks.push("");
      continue;
    }

    if (paragraph.length <= 450) {
      chunks.push(await translateText(paragraph, from, to));
      continue;
    }

    const sentences = paragraph.match(/[^.!?]+[.!?]?/g) ?? [paragraph];
    let buffer = "";
    for (const sentence of sentences) {
      if ((buffer + sentence).length > 450 && buffer) {
        chunks.push(await translateText(buffer.trim(), from, to));
        buffer = sentence;
      } else {
        buffer += sentence;
      }
    }
    if (buffer.trim()) {
      chunks.push(await translateText(buffer.trim(), from, to));
    }
  }

  return chunks.join("\n\n");
}
