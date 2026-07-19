import { signIn } from "@/auth";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import Link from "next/link";
import "./auth.css";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Уже вошли — сразу в личный кабинет
  await redirectIfAuthenticated();

  const { callbackUrl } = await searchParams;
  const redirectTo = callbackUrl?.startsWith("/") ? callbackUrl : "/dashboard";

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">CalmExchange</p>
        <h1>Вход</h1>
        <p className="auth-subtitle">
          Войдите через Google, чтобы управлять своими медитациями.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo });
          }}
        >
          <button type="submit" className="auth-btn auth-btn-google">
            Войти через Google
          </button>
        </form>

        <Link href="/" className="auth-link">
          На главную
        </Link>
      </div>
    </main>
  );
}
