import { signIn } from "@/auth";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import Link from "next/link";
import "./auth.css";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

const AUTH_ERRORS: Record<string, string> = {
  Configuration:
    "Ошибка конфигурации Auth.js. Проверьте /api/auth/check-config и переменные Vercel.",
  AccessDenied:
    "Доступ запрещён Google. Добавьте email в Test users (Google Cloud Console).",
  Verification: "Ошибка верификации. Попробуйте снова.",
  OAuthSignin: "Не удалось начать OAuth. Проверьте GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET.",
  OAuthCallback:
    "Ошибка callback. Redirect URI: https://calm-exchange.vercel.app/api/auth/callback/google",
  OAuthCreateAccount: "Не удалось создать пользователя. Проверьте DATABASE_URL и миграции.",
  Default: "Не удалось войти. Попробуйте снова.",
};

function resolveRedirectTo(callbackUrl?: string): string {
  if (!callbackUrl) {
    return "/dashboard";
  }

  if (callbackUrl.startsWith("/")) {
    return callbackUrl;
  }

  try {
    const url = new URL(callbackUrl);
    return url.pathname + url.search;
  } catch {
    return "/dashboard";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectIfAuthenticated();

  const { callbackUrl, error } = await searchParams;
  const redirectTo = resolveRedirectTo(callbackUrl);
  const errorMessage = error ? (AUTH_ERRORS[error] ?? AUTH_ERRORS.Default) : null;

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">CalmExchange</p>
        <h1>Вход</h1>
        <p className="auth-subtitle">
          Войдите через Google, чтобы управлять своими медитациями.
        </p>

        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

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
