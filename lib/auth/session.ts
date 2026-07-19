import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Server-side проверка: пользователь должен быть авторизован.
 * Иначе — редирект на /login.
 */
export async function requireSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

/**
 * Server-side проверка: вернуть userId или null (без редиректа).
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * Server-side проверка: уже авторизован — редирект в кабинет.
 */
export async function redirectIfAuthenticated(redirectTo = "/dashboard") {
  const session = await auth();

  if (session?.user?.id) {
    redirect(redirectTo);
  }
}
