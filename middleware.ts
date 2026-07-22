import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Цепочка: Auth.js (защита dashboard) → next-intl (локаль из cookie).
 */
export default NextAuth(authConfig).auth((request) => {
  return intlMiddleware(request);
});

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
