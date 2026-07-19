import { signOut } from "@/auth";
import { requireSession } from "@/lib/auth/session";
import Link from "next/link";
import "../login/auth.css";

export default async function DashboardPage() {
  // Server-side проверка сессии
  const session = await requireSession();

  return (
    <main className="auth-page">
      <div className="auth-card auth-card-wide">
        <p className="auth-kicker">Личный кабинет</p>
        <h1>Привет, {session.user.name ?? session.user.email}</h1>
        <p className="auth-subtitle">userId: {session.user.id}</p>

        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="auth-avatar"
            width={64}
            height={64}
          />
        ) : null}

        <div className="auth-actions">
          <Link href="/my-meditations" className="auth-btn auth-btn-secondary">
            Мои медитации
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="auth-btn auth-btn-outline">
              Выйти
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
