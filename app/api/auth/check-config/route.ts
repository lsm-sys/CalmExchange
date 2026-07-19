import { prisma } from "@/lib/prisma";
import { getAuthBaseUrl, getAuthSecret } from "@/lib/auth/env";

function validateAuthEnv() {
  const authSecret = getAuthSecret()?.trim() ?? "";
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";

  const hasAuthSecret = authSecret.length > 0;
  const hasGoogleClientId = googleClientId.length > 0;
  const hasGoogleClientSecret = googleClientSecret.length > 0;
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
  const authUrlEnv = process.env.AUTH_URL?.trim() ?? null;

  const validAuthSecret = authSecret.length >= 32;
  const validGoogleClientId =
    googleClientId.endsWith(".apps.googleusercontent.com") &&
    !googleClientId.includes("your-google-client-id");
  const validGoogleClientSecret =
    googleClientSecret.startsWith("GOCSPX-") &&
    !googleClientSecret.includes("your-google-client-secret");
  const validAuthUrl =
    !authUrlEnv ||
    authUrlEnv === "https://calm-exchange.vercel.app" ||
    authUrlEnv === "http://localhost:3000";

  const ok =
    hasAuthSecret &&
    hasGoogleClientId &&
    hasGoogleClientSecret &&
    hasDatabaseUrl &&
    validAuthSecret &&
    validGoogleClientId &&
    validGoogleClientSecret &&
    validAuthUrl;

  return {
    ok,
    hasAuthSecret,
    hasGoogleClientId,
    hasGoogleClientSecret,
    hasDatabaseUrl,
    validAuthSecret,
    validGoogleClientId,
    validGoogleClientSecret,
    validAuthUrl,
    authSecretLength: authSecret.length,
    googleClientIdSuffix: googleClientId.slice(-30) || null,
    authUrlEnv,
    authBaseUrl: getAuthBaseUrl() ?? null,
    hints: [
      !validAuthSecret &&
        "AUTH_SECRET слишком короткий (нужно ≥ 32 символов).",
      !validGoogleClientId &&
        "GOOGLE_CLIENT_ID должен заканчиваться на .apps.googleusercontent.com.",
      !validGoogleClientSecret &&
        "GOOGLE_CLIENT_SECRET должен начинаться с GOCSPX-.",
      !validAuthUrl &&
        "AUTH_URL должен быть https://calm-exchange.vercel.app (без /api/auth).",
    ].filter(Boolean),
  };
}

export async function GET() {
  const envCheck = validateAuthEnv();
  let databaseOk = false;
  let databaseError: string | null = null;

  try {
    await prisma.session.count();
    databaseOk = true;
  } catch (error) {
    databaseError =
      error instanceof Error ? error.message : "Database connection failed";
  }

  return Response.json({
    ...envCheck,
    databaseOk,
    databaseError,
    ok: envCheck.ok && databaseOk,
  });
}

export const runtime = "nodejs";
