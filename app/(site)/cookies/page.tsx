import { getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/legal/LegalDocument";

export default async function CookiesPage() {
  const t = await getTranslations("legal.cookiesPage");

  return (
    <LegalDocument
      title={t("title")}
      lastUpdated={t("lastUpdated")}
      sections={[
        { heading: t("s1Title"), body: t("s1Body") },
        { heading: t("s2Title"), body: t("s2Body") },
        { heading: t("s3Title"), body: t("s3Body") },
      ]}
      relatedLinks={[
        { href: "/privacy", label: t("privacyLink") },
        { href: "/terms", label: t("termsLink") },
      ]}
    />
  );
}
