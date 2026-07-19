import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  let notes: { id: string; title: string; createdAt: Date }[] = [];
  let error: string | null = null;

  try {
    notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } catch (e) {
    console.error("Failed to fetch notes:", e);
    error =
      "Не удалось подключиться к базе данных. Проверьте переменную DATABASE_URL.";
  }

  return (
    <main>
      <header className="home-header">
        <div>
          <h1>CalmExchange</h1>
          <p className="subtitle">Échange des méditations</p>
        </div>
        <nav className="home-nav">
          {session?.user ? (
            <>
              <span className="home-user">
                {session.user.name ?? session.user.email}
              </span>
              <Link href="/dashboard" className="home-link">
                Кабинет
              </Link>
            </>
          ) : (
            <Link href="/login" className="home-link home-link-primary">
              Войти
            </Link>
          )}
        </nav>
      </header>

      <p className="subtitle">Проверка подключения к PostgreSQL (Neon)</p>

      {error ? (
        <p className="error">{error}</p>
      ) : notes.length === 0 ? (
        <p className="empty">База подключена. Заметок пока нет.</p>
      ) : (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id} className="note-item">
              <p className="note-title">{note.title}</p>
              <p className="note-meta">
                {note.createdAt.toLocaleString("ru-RU")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
