import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let notes: { id: string; title: string; createdAt: Date }[] = [];
  let error: string | null = null;

  try {
    notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Failed to fetch notes:", e);
    error =
      "Не удалось подключиться к базе данных. Проверьте переменную DATABASE_URL.";
  }

  return (
    <main>
      <h1>CalmExchange</h1>
      <p className="subtitle">Заметки из PostgreSQL (Neon)</p>

      {error ? (
        <p className="error">{error}</p>
      ) : notes.length === 0 ? (
        <p className="empty">
          Заметок пока нет. Запустите seed:{" "}
          <code>npm run db:seed</code>
        </p>
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
