import { getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/legal/LegalDocument";

export default async function TermsPage() {
  const t = await getTranslations("legal.terms");

  return (
    <LegalDocument
      title={t("title")}
      lastUpdated={t("lastUpdated")}
      sections={[
        { heading: t("s1Title"), body: t("s1Body") },
        { heading: t("s2Title"), body: t("s2Body") },
        { heading: t("s3Title"), body: t("s3Body") },
        { heading: t("s4Title"), body: t("s4Body") },
      ]}
      relatedLinks={[
        { href: "/privacy", label: t("privacyLink") },
        { href: "/cookies", label: t("cookiesLink") },
      ]}
    />
  );
}
