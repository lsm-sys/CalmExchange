import { getAuthBaseUrl } from "@/lib/auth/env";

/**
 * Безопасная диагностика (не раскрывает секреты).
 * Откройте /api/auth/check-config на Vercel, чтобы проверить переменные окружения.
 */
export async function GET() {
  return Response.json({
    ok:
      Boolean(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET) &&
      Boolean(process.env.GOOGLE_CLIENT_ID) &&
      Boolean(process.env.GOOGLE_CLIENT_SECRET),
    hasAuthSecret: Boolean(
      process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    ),
    hasGoogleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
    hasGoogleClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    authBaseUrl: getAuthBaseUrl() ?? null,
  });
}
