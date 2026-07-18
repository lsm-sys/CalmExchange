export type DbTarget = "local" | "work";

export type ColumnInfo = {
  name: string;
  dataType: string;
  udtName: string;
  isNullable: boolean;
  hasDefault: boolean;
  isPrimaryKey: boolean;
};

export type TableMeta = {
  name: string;
  columns: ColumnInfo[];
  primaryKey: string[];
};

export type TableListItem = {
  name: string;
  rowCount: number;
};

export type PaginatedRows = {
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function parseDbTarget(value: string | null | undefined): DbTarget | null {
  if (value === "local" || value === "work") {
    return value;
  }
  return null;
}
