import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Middleware: защита /dashboard и /my-meditations.
 * authorized() в auth.config.ts возвращает false → редирект на /login.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*", "/my-meditations/:path*"],
};
