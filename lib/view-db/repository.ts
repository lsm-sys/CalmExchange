import { getPool, quoteIdent } from "./connection";
import type {
  ColumnInfo,
  DbTarget,
  PaginatedRows,
  TableListItem,
  TableMeta,
} from "./types";

const TABLE_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function assertValidTableName(table: string): void {
  if (!TABLE_NAME_RE.test(table)) {
    throw new Error("Недопустимое имя таблицы.");
  }
}

async function tableExists(target: DbTarget, table: string): Promise<boolean> {
  const pool = getPool(target);
  const result = await pool.query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
          AND table_type = 'BASE TABLE'
      ) AS exists
    `,
    [table],
  );

  return result.rows[0]?.exists ?? false;
}

export async function assertTableAccess(
  target: DbTarget,
  table: string,
): Promise<void> {
  assertValidTableName(table);

  if (!(await tableExists(target, table))) {
    throw new Error(`Таблица "${table}" не найдена.`);
  }
}

export async function listTables(target: DbTarget): Promise<TableListItem[]> {
  const pool = getPool(target);

  const tablesResult = await pool.query<{ table_name: string }>(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `,
  );

  const items: TableListItem[] = [];

  for (const row of tablesResult.rows) {
    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ${quoteIdent(row.table_name)}`,
    );
    items.push({
      name: row.table_name,
      rowCount: Number(countResult.rows[0]?.count ?? 0),
    });
  }

  return items;
}

export async function getTableMeta(
  target: DbTarget,
  table: string,
): Promise<TableMeta> {
  await assertTableAccess(target, table);
  const pool = getPool(target);

  const columnsResult = await pool.query<{
    column_name: string;
    data_type: string;
    udt_name: string;
    is_nullable: string;
    column_default: string | null;
  }>(
    `
      SELECT column_name, data_type, udt_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [table],
  );

  const pkResult = await pool.query<{ column_name: string }>(
    `
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'PRIMARY KEY'
      ORDER BY kcu.ordinal_position
    `,
    [table],
  );

  const primaryKey = pkResult.rows.map((row) => row.column_name);
  const pkSet = new Set(primaryKey);

  const columns: ColumnInfo[] = columnsResult.rows.map((row) => ({
    name: row.column_name,
    dataType: row.data_type,
    udtName: row.udt_name,
    isNullable: row.is_nullable === "YES",
    hasDefault: row.column_default !== null,
    isPrimaryKey: pkSet.has(row.column_name),
  }));

  return { name: table, columns, primaryKey };
}

export async function getTableRows(
  target: DbTarget,
  table: string,
  page: number,
  pageSize: number,
): Promise<PaginatedRows> {
  await assertTableAccess(target, table);
  const pool = getPool(target);
  const meta = await getTableMeta(target, table);

  const orderBy =
    meta.primaryKey.length > 0
      ? meta.primaryKey.map((column) => quoteIdent(column)).join(", ")
      : quoteIdent(meta.columns[0]?.name ?? "1");

  const offset = (page - 1) * pageSize;

  const [rowsResult, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM ${quoteIdent(table)} ORDER BY ${orderBy} LIMIT $1 OFFSET $2`,
      [pageSize, offset],
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ${quoteIdent(table)}`,
    ),
  ]);

  const total = Number(countResult.rows[0]?.count ?? 0);

  return {
    rows: rowsResult.rows as Record<string, unknown>[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

function normalizeValue(value: unknown): unknown {
  if (value === "" || value === undefined) {
    return null;
  }
  return value;
}

function pickWritableColumns(meta: TableMeta): ColumnInfo[] {
  return meta.columns.filter((column) => !column.hasDefault || !column.isPrimaryKey);
}

function applyAutoTimestamps(
  meta: TableMeta,
  data: Record<string, unknown>,
  mode: "create" | "update",
): Record<string, unknown> {
  const result = { ...data };

  for (const column of meta.columns) {
    if (
      column.name === "updatedAt" &&
      column.dataType.includes("timestamp") &&
      result.updatedAt === undefined
    ) {
      result.updatedAt = new Date().toISOString();
    }

    if (
      mode === "create" &&
      column.name === "createdAt" &&
      column.dataType.includes("timestamp") &&
      !column.hasDefault &&
      result.createdAt === undefined
    ) {
      result.createdAt = new Date().toISOString();
    }
  }

  return result;
}

export async function createRow(
  target: DbTarget,
  table: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const meta = await getTableMeta(target, table);
  const pool = getPool(target);
  const enriched = applyAutoTimestamps(meta, data, "create");

  const writable = pickWritableColumns(meta).filter(
    (column) =>
      enriched[column.name] !== undefined && enriched[column.name] !== "",
  );

  if (writable.length === 0) {
    throw new Error("Нет данных для создания записи.");
  }

  const columns = writable.map((column) => quoteIdent(column.name));
  const placeholders = writable.map((_, index) => `$${index + 1}`);
  const values = writable.map((column) => normalizeValue(enriched[column.name]));

  const result = await pool.query(
    `
      INSERT INTO ${quoteIdent(table)} (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *
    `,
    values,
  );

  return result.rows[0] as Record<string, unknown>;
}

export async function updateRow(
  target: DbTarget,
  table: string,
  primaryKey: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const meta = await getTableMeta(target, table);
  const pool = getPool(target);
  const enriched = applyAutoTimestamps(meta, data, "update");

  if (meta.primaryKey.length === 0) {
    throw new Error("У таблицы нет первичного ключа для обновления.");
  }

  for (const key of meta.primaryKey) {
    if (primaryKey[key] === undefined) {
      throw new Error(`Не указано значение первичного ключа: ${key}`);
    }
  }

  const updates = meta.columns.filter(
    (column) =>
      !column.isPrimaryKey &&
      enriched[column.name] !== undefined &&
      !meta.primaryKey.includes(column.name),
  );

  if (updates.length === 0) {
    throw new Error("Нет полей для обновления.");
  }

  const setClause = updates
    .map((column, index) => `${quoteIdent(column.name)} = $${index + 1}`)
    .join(", ");

  const setValues = updates.map((column) => normalizeValue(enriched[column.name]));
  const whereStart = updates.length + 1;
  const whereClause = meta.primaryKey
    .map(
      (column, index) =>
        `${quoteIdent(column)} = $${whereStart + index}`,
    )
    .join(" AND ");
  const whereValues = meta.primaryKey.map((column) => primaryKey[column]);

  const result = await pool.query(
    `
      UPDATE ${quoteIdent(table)}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING *
    `,
    [...setValues, ...whereValues],
  );

  if (result.rowCount === 0) {
    throw new Error("Запись не найдена.");
  }

  return result.rows[0] as Record<string, unknown>;
}

export async function deleteRow(
  target: DbTarget,
  table: string,
  primaryKey: Record<string, unknown>,
): Promise<void> {
  const meta = await getTableMeta(target, table);
  const pool = getPool(target);

  if (meta.primaryKey.length === 0) {
    throw new Error("У таблицы нет первичного ключа для удаления.");
  }

  for (const key of meta.primaryKey) {
    if (primaryKey[key] === undefined) {
      throw new Error(`Не указано значение первичного ключа: ${key}`);
    }
  }

  const whereClause = meta.primaryKey
    .map((column, index) => `${quoteIdent(column)} = $${index + 1}`)
    .join(" AND ");
  const whereValues = meta.primaryKey.map((column) => primaryKey[column]);

  const result = await pool.query(
    `DELETE FROM ${quoteIdent(table)} WHERE ${whereClause}`,
    whereValues,
  );

  if (result.rowCount === 0) {
    throw new Error("Запись не найдена.");
  }
}
