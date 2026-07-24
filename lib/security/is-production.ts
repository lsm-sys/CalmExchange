/** Production-среда (Vercel или NODE_ENV). */
export function isProduction(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}
