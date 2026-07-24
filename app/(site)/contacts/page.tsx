import { getTranslations } from "next-intl/server";

export default async function ContactsPage() {
  const t = await getTranslations("legal.contacts");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-4 whitespace-pre-line text-muted-foreground leading-relaxed">
        {t("body")}
      </p>
    </div>
  );
}
