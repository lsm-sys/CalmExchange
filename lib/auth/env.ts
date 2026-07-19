/**
 * Канонический URL для OAuth callback.
 * Preview-деплои Vercel иначе подставляют случайный домен → redirect_uri_mismatch.
 */
export function getAuthBaseUrl(): string | undefined {
  if (process.env.AUTH_URL) {
    return process.env.AUTH_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return undefined;
}

export function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}
