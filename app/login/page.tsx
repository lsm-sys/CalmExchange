import { signIn } from "@/auth";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import Link from "next/link";
import "./auth.css";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

const AUTH_ERRORS: Record<string, string> = {
  Configuration:
    "Ошибка конфигурации на сервере. На Vercel проверьте AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET и выполните Redeploy.",
  AccessDenied:
    "Доступ запрещён Google. Если приложение в режиме Testing — добавьте ваш email в Test users (Google Cloud Console).",
  Verification:
    "Ошибка верификации. Попробуйте снова или проверьте redirect URI в Google Console.",
  OAuthSignin: "Не удалось начать вход через Google. Проверьте Client ID и Client Secret.",
  OAuthCallback:
    "Ошибка после возврата из Google. Проверьте redirect URI: https://calm-exchange.vercel.app/api/auth/callback/google",
  OAuthCreateAccount: "Не удалось создать пользователя в базе. Проверьте DATABASE_URL на Vercel.",
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
