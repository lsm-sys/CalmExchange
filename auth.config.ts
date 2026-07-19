import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { getAuthSecret } from "@/lib/auth/env";

/**
 * Edge-совместимая часть конфигурации Auth.js (middleware).
 * Не добавляйте сюда session callback с user — в middleware user может быть undefined.
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
  },
  trustHost: true,
  secret: getAuthSecret(),
} satisfies NextAuthConfig;
