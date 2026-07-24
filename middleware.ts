import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "./auth.config";
import { isProduction } from "@/lib/security/is-production";

const authHandler = NextAuth(authConfig).auth;

function blockRestrictedInProduction(request: NextRequest) {
  if (!isProduction()) {
    return null;
  }

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/view-db") ||
    pathname.startsWith("/api/view-db") ||
    pathname === "/api/auth/check-config"
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return null;
}

export default async function middleware(request: NextRequest) {
  const blocked = blockRestrictedInProduction(request);
  if (blocked) {
    return blocked;
  }

  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/my-meditations")
  ) {
    return authHandler(request as never);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-meditations/:path*",
    "/view-db/:path*",
    "/api/view-db/:path*",
    "/api/auth/check-config",
  ],
};
