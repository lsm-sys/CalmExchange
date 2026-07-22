import { signIn } from "@/auth";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import "./auth.css";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
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
  const t = await getTranslations("auth");

  const { callbackUrl, error } = await searchParams;
  const redirectTo = resolveRedirectTo(callbackUrl);
  const errorMessage = await getAuthErrorMessage(error);

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">CalmExchange</p>
        <h1>{t("title")}</h1>
        <p className="auth-subtitle">{t("subtitle")}</p>

        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo });
          }}
        >
          <button type="submit" className="auth-btn auth-btn-google">
            {t("signInGoogle")}
          </button>
        </form>

        <Link href="/" className="auth-link">
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
