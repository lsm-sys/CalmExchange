import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv();

/**
 * JS-конфиг (не .ts) — надёжнее на Vercel при postinstall → prisma generate.
 * process.env вместо env() — generate не падает без DATABASE_URL.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  ...(process.env.DATABASE_URL
    ? {
        datasource: {
          url: process.env.DATABASE_URL,
          ...(process.env.DIRECT_URL
            ? { shadowDatabaseUrl: process.env.DIRECT_URL }
            : {}),
        },
      }
    : {}),
});
