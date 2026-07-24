import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * process.env вместо env() — prisma generate на CI/Vercel не требует
 * реальных URL, но env() бросает ошибку при отсутствии переменной.
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
