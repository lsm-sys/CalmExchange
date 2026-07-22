import { getTranslations } from "next-intl/server";

const AUTH_ERROR_KEYS = [
  "Configuration",
  "AccessDenied",
  "Verification",
  "OAuthSignin",
  "OAuthCallback",
  "OAuthCreateAccount",
  "Default",
] as const;

type AuthErrorKey = (typeof AUTH_ERROR_KEYS)[number];

function isAuthErrorKey(value: string): value is AuthErrorKey {
  return (AUTH_ERROR_KEYS as readonly string[]).includes(value);
}

export async function getAuthErrorMessage(error?: string): Promise<string | null> {
  if (!error) {
    return null;
  }

  const t = await getTranslations("auth");
  const key = isAuthErrorKey(error) ? error : "Default";
  return t(`errors.${key}`);
}
