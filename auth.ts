import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import { getAuthBaseUrl, getAuthSecret } from "@/lib/auth/env";
import { authConfig } from "./auth.config";

/**
 * Конфигурация создаётся при каждом запросе — env на Vercel доступен надёжнее.
 * JWT-сессии: cookie подписан AUTH_SECRET; User/Account хранятся в PostgreSQL через adapter.
 */
function createAuthConfig() {
  return {
    ...authConfig,
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ],
    secret: getAuthSecret(),
    ...(getAuthBaseUrl() ? { url: getAuthBaseUrl() } : {}),
    adapter: PrismaAdapter(prisma),
    session: {
      // JWT надёжнее database sessions на Vercel serverless + Neon
      strategy: "jwt" as const,
      maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
      ...authConfig.callbacks,
      jwt({
        token,
        user,
      }: {
        token: JWT;
        user?: { id?: string };
      }) {
        if (user?.id) {
          token.sub = user.id;
        }
        return token;
      },
      session({
        session,
        token,
      }: {
        session: Session;
        token: JWT;
      }) {
        if (session.user && token.sub) {
          session.user.id = token.sub;
        }
        return session;
      },
    },
    debug: process.env.AUTH_DEBUG === "true",
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(createAuthConfig);
