import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Middleware: защита /dashboard и /my-meditations.
 * Локаль (i18n) задаётся через cookie NEXT_LOCALE в i18n/request.ts — без rewrite URL.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*", "/my-meditations/:path*"],
};
