import { requireSession } from "@/lib/auth/session";
import { getMyMeditations } from "@/lib/meditations";
import Link from "next/link";
import "../login/auth.css";

export default async function MyMeditationsPage() {
  const session = await requireSession();
  const meditations = await getMyMeditations(session.user.id);

  return (
    <main className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-panel-head">
          <div>
            <p className="auth-kicker">Мои медитации</p>
            <h1>{session.user.name ?? "Без имени"}</h1>
            <p className="auth-subtitle">
              Приватные видны только вам. Публичные доступны другим пользователям.
            </p>
          </div>
          <Link href="/dashboard" className="auth-link">
            В кабинет
          </Link>
        </div>

        {meditations.length === 0 ? (
          <p className="auth-empty">У вас пока нет медитаций.</p>
        ) : (
          <ul className="auth-list">
            {meditations.map((meditation) => (
              <li key={meditation.id} className="auth-list-item">
                <div>
                  <strong>{meditation.title}</strong>
                  <span className="auth-badge">{meditation.visibility}</span>
                </div>
                <p className="auth-muted">
                  {meditation.updatedAt.toLocaleString("ru-RU")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
