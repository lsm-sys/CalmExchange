import Link from "next/link";

type LegalDocumentProps = {
  title: string;
  lastUpdated: string;
  sections: { heading: string; body: string }[];
  relatedLinks?: { href: string; label: string }[];
};

export function LegalDocument({
  title,
  lastUpdated,
  sections,
  relatedLinks,
}: LegalDocumentProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-8 space-y-2 border-b border-border/60 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{lastUpdated}</p>
      </header>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      {relatedLinks && relatedLinks.length > 0 ? (
        <nav className="mt-10 flex flex-wrap gap-4 border-t border-border/60 pt-6 text-sm">
          {relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-primary hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </article>
  );
}
