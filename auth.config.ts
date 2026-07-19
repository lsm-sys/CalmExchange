import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Канонический URL для OAuth callback.
 * Preview-деплои Vercel (calm-exchange-xxx.vercel.app) иначе ломают Google OAuth.
 */
function getAuthBaseUrl(): string | undefined {
  if (process.env.AUTH_URL) {
    return process.env.AUTH_URL.replace(/\/$/, "");
  }

  // Vercel задаёт production-домен на всех деплоях (в т.ч. preview)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return undefined;
}

const authBaseUrl = getAuthBaseUrl();

/**
 * Edge-совместимая часть конфигурации Auth.js.
 * Используется в middleware (без Prisma).
 */
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isProtected =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/my-meditations");

      if (!isProtected) {
        return true;
      }

      return !!auth?.user;
    },
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  ...(authBaseUrl ? { url: authBaseUrl } : {}),
} satisfies NextAuthConfig;
