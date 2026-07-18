import { Pool } from "pg";
import type { DbTarget } from "./types";

const pools = new Map<string, Pool>();

export function getDatabaseUrl(target: DbTarget): string {
  const url =
    target === "local" ? process.env.DATABASE_URL : process.env.WORK_DATABASE_URL;

  if (!url) {
    const envName = target === "local" ? "DATABASE_URL" : "WORK_DATABASE_URL";
    throw new Error(`Переменная окружения ${envName} не задана.`);
  }

  return url;
}

export function getPool(target: DbTarget): Pool {
  const url = getDatabaseUrl(target);

  let pool = pools.get(url);
  if (!pool) {
    pool = new Pool({ connectionString: url });
    pools.set(url, pool);
  }

  return pool;
}

export function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}
