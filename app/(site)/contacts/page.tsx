import { getTranslations } from "next-intl/server";

export default async function ContactsPage() {
  const t = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("contactsTitle")}</h1>
      <p className="mt-4 text-muted-foreground">{t("contactsBody")}</p>
    </div>
  );
}
