import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getFormatter, getTranslations } from "next-intl/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const t = await getTranslations("home");
  const format = await getFormatter();

  let notes: { id: string; title: string; createdAt: Date }[] = [];
  let error: string | null = null;

  try {
    notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } catch (e) {
    console.error("Failed to fetch notes:", e);
    error = t("dbError");
  }

  return (
    <main className="home-main">
      <header className="home-header">
        <div>
          <h1>CalmExchange</h1>
          <p className="subtitle">{t("subtitle")}</p>
        </div>
        <nav className="home-nav">
          {session?.user ? (
            <>
              <span className="home-user">
                {session.user.name ?? session.user.email}
              </span>
              <Link href="/dashboard" className="home-link">
                {t("cabinet")}
              </Link>
            </>
          ) : (
            <Link href="/login" className="home-link home-link-primary">
              {t("signIn")}
            </Link>
          )}
        </nav>
      </header>

      <p className="subtitle">{t("dbCheck")}</p>

      {error ? (
        <p className="error">{error}</p>
      ) : notes.length === 0 ? (
        <p className="empty">{t("dbEmpty")}</p>
      ) : (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id} className="note-item">
              <p className="note-title">{note.title}</p>
              <p className="note-meta">
                {format.dateTime(note.createdAt, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
