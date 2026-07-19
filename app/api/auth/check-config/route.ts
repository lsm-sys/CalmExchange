import { getAuthBaseUrl, getAuthSecret } from "@/lib/auth/env";

function validateAuthEnv() {
  const authSecret = getAuthSecret()?.trim() ?? "";
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";

  const hasAuthSecret = authSecret.length > 0;
  const hasGoogleClientId = googleClientId.length > 0;
  const hasGoogleClientSecret = googleClientSecret.length > 0;
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

  const validAuthSecret = authSecret.length >= 32;
  const validGoogleClientId =
    googleClientId.endsWith(".apps.googleusercontent.com") &&
    !googleClientId.includes("your-google-client-id");
  const validGoogleClientSecret =
    googleClientSecret.startsWith("GOCSPX-") &&
    !googleClientSecret.includes("your-google-client-secret");

  const ok =
    hasAuthSecret &&
    hasGoogleClientId &&
    hasGoogleClientSecret &&
    hasDatabaseUrl &&
    validAuthSecret &&
    validGoogleClientId &&
    validGoogleClientSecret;

  return {
    ok,
    hasAuthSecret,
    hasGoogleClientId,
    hasGoogleClientSecret,
    hasDatabaseUrl,
    validAuthSecret,
    validGoogleClientId,
    validGoogleClientSecret,
    authSecretLength: authSecret.length,
    googleClientIdSuffix: googleClientId.slice(-30) || null,
    authBaseUrl: getAuthBaseUrl() ?? null,
    hints: [
      !validAuthSecret &&
        "AUTH_SECRET слишком короткий (нужно ≥ 32 символов). Сгенерируйте заново.",
      !validGoogleClientId &&
        "GOOGLE_CLIENT_ID должен заканчиваться на .apps.googleusercontent.com (не placeholder).",
      !validGoogleClientSecret &&
        "GOOGLE_CLIENT_SECRET должен начинаться с GOCSPX- (скопируйте из Google Console).",
    ].filter(Boolean),
  };
}

/**
 * Безопасная диагностика (не раскрывает секреты целиком).
 * Откройте /api/auth/check-config на Vercel.
 */
export async function GET() {
  return Response.json(validateAuthEnv());
}
