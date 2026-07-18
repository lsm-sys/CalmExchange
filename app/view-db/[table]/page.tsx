"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type {
  ColumnInfo,
  DbTarget,
  PaginatedRows,
  TableMeta,
} from "@/lib/view-db/types";
import "../view-db.css";

type FormMode = "create" | "edit" | null;

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function inputType(column: ColumnInfo): string {
  if (column.dataType === "boolean") {
    return "checkbox";
  }
  if (
    column.dataType.includes("int") ||
    column.dataType === "numeric" ||
    column.dataType === "double precision" ||
    column.dataType === "real"
  ) {
    return "number";
  }
  if (column.dataType.includes("timestamp") || column.dataType === "date") {
    return "datetime-local";
  }
  return "text";
}

function rowPrimaryKey(
  row: Record<string, unknown>,
  primaryKey: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of primaryKey) {
    result[key] = row[key];
  }
  return result;
}

export default function ViewDbTablePage() {
  const params = useParams<{ table: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const table = decodeURIComponent(params.table);
  const db = (searchParams.get("db") === "work" ? "work" : "local") as DbTarget;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const [meta, setMeta] = useState<TableMeta | null>(null);
  const [data, setData] = useState<PaginatedRows | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [editPrimaryKey, setEditPrimaryKey] = useState<Record<string, unknown>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  const editableColumns = useMemo(() => {
    if (!meta) {
      return [];
    }

    if (formMode === "create") {
      return meta.columns.filter((column) => !column.isPrimaryKey || !column.hasDefault);
    }

    return meta.columns.filter((column) => !column.isPrimaryKey);
  }, [formMode, meta]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [metaResponse, rowsResponse] = await Promise.all([
        fetch(
          `/api/view-db/${encodeURIComponent(table)}?db=${db}&mode=meta`,
        ),
        fetch(
          `/api/view-db/${encodeURIComponent(table)}?db=${db}&page=${page}&pageSize=10`,
        ),
      ]);

      const metaPayload = (await metaResponse.json()) as {
        meta?: TableMeta;
        error?: string;
      };
      const rowsPayload = (await rowsResponse.json()) as PaginatedRows & {
        error?: string;
      };

      if (!metaResponse.ok) {
        throw new Error(metaPayload.error ?? "Не удалось загрузить метаданные.");
      }
      if (!rowsResponse.ok) {
        throw new Error(rowsPayload.error ?? "Не удалось загрузить строки.");
      }

      setMeta(metaPayload.meta ?? null);
      setData(rowsPayload);
    } catch (err) {
      setMeta(null);
      setData(null);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка.");
    } finally {
      setLoading(false);
    }
  }, [db, page, table]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function openCreateForm() {
    if (!meta) {
      return;
    }

    const initial: Record<string, string> = {};
    for (const column of meta.columns) {
      if (!column.isPrimaryKey || !column.hasDefault) {
        initial[column.name] = "";
      }
    }

    setFormValues(initial);
    setEditPrimaryKey({});
    setFormMode("create");
  }

  function openEditForm(row: Record<string, unknown>) {
    if (!meta) {
      return;
    }

    const initial: Record<string, string> = {};
    for (const column of meta.columns) {
      initial[column.name] =
        row[column.name] === null || row[column.name] === undefined
          ? ""
          : String(row[column.name]);
    }

    setFormValues(initial);
    setEditPrimaryKey(rowPrimaryKey(row, meta.primaryKey));
    setFormMode("edit");
  }

  async function handleDelete(row: Record<string, unknown>) {
    if (!meta) {
      return;
    }

    const pk = rowPrimaryKey(row, meta.primaryKey);
    const label = meta.primaryKey.map((key) => `${key}=${row[key]}`).join(", ");

    if (!window.confirm(`Удалить запись (${label})?`)) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/view-db/${encodeURIComponent(table)}?db=${db}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ primaryKey: pk }),
        },
      );

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Не удалось удалить запись.");
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!meta || !formMode) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const payloadData: Record<string, unknown> = {};
    for (const column of editableColumns) {
      const raw = formValues[column.name];
      if (column.dataType === "boolean") {
        payloadData[column.name] = raw === "true";
      } else if (raw !== "") {
        payloadData[column.name] = raw;
      }
    }

    try {
      const response = await fetch(
        `/api/view-db/${encodeURIComponent(table)}?db=${db}`,
        {
          method: formMode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            formMode === "create"
              ? { data: payloadData }
              : { primaryKey: editPrimaryKey, data: payloadData },
          ),
        },
      );

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Не удалось сохранить запись.");
      }

      setFormMode(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка.");
    } finally {
      setSubmitting(false);
    }
  }

  function goToPage(nextPage: number) {
    router.push(
      `/view-db/${encodeURIComponent(table)}?db=${db}&page=${nextPage}`,
    );
  }

  return (
    <main className="view-db">
      <header className="view-db-header">
        <div>
          <p className="view-db-kicker">view-db / {table}</p>
          <h1>{table}</h1>
          <p className="view-db-subtitle">
            База: {db === "local" ? "локальная" : "рабочая"}
          </p>
        </div>
        <Link href={`/view-db?db=${db}`} className="view-db-link">
          К списку таблиц
        </Link>
      </header>

      <section className="view-db-toolbar">
        <button
          type="button"
          className="view-db-btn view-db-btn-primary"
          onClick={openCreateForm}
          disabled={loading || !meta}
        >
          Создать
        </button>
        <button
          type="button"
          className="view-db-btn"
          onClick={() => void loadData()}
          disabled={loading}
        >
          Обновить
        </button>
      </section>

      {error ? <p className="view-db-error">{error}</p> : null}
      {loading ? <p className="view-db-muted">Загрузка...</p> : null}

      {!loading && data && meta ? (
        <>
          <div className="view-db-table-wrap">
            <table className="view-db-data-table">
              <thead>
                <tr>
                  {meta.columns.map((column) => (
                    <th key={column.name}>{column.name}</th>
                  ))}
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.length === 0 ? (
                  <tr>
                    <td colSpan={meta.columns.length + 1} className="view-db-muted">
                      Нет записей
                    </td>
                  </tr>
                ) : (
                  data.rows.map((row, index) => (
                    <tr key={index}>
                      {meta.columns.map((column) => (
                        <td key={column.name}>{formatCell(row[column.name])}</td>
                      ))}
                      <td className="view-db-actions">
                        <button
                          type="button"
                          className="view-db-btn"
                          onClick={() => openEditForm(row)}
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          className="view-db-btn view-db-btn-danger"
                          onClick={() => void handleDelete(row)}
                          disabled={submitting || meta.primaryKey.length === 0}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="view-db-pagination">
            <button
              type="button"
              className="view-db-btn"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              Назад
            </button>
            <span className="view-db-muted">
              Страница {data.page} из {data.totalPages} ({data.total} строк)
            </span>
            <button
              type="button"
              className="view-db-btn"
              disabled={page >= data.totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Вперёд
            </button>
          </div>
        </>
      ) : null}

      {formMode && meta ? (
        <div className="view-db-modal-backdrop">
          <div className="view-db-modal">
            <h2>{formMode === "create" ? "Создать запись" : "Изменить запись"}</h2>
            <form className="view-db-form" onSubmit={(event) => void handleSubmit(event)}>
              {editableColumns.map((column) => (
                <label key={column.name} className="view-db-field">
                  <span>
                    {column.name}
                    {!column.isNullable ? " *" : ""}
                  </span>
                  {column.dataType === "boolean" ? (
                    <select
                      value={formValues[column.name] ?? "false"}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          [column.name]: event.target.value,
                        }))
                      }
                    >
                      <option value="false">false</option>
                      <option value="true">true</option>
                    </select>
                  ) : column.udtName === "Visibility" ? (
                    <select
                      value={formValues[column.name] ?? "PRIVATE"}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          [column.name]: event.target.value,
                        }))
                      }
                    >
                      <option value="PRIVATE">PRIVATE</option>
                      <option value="PUBLIC">PUBLIC</option>
                    </select>
                  ) : (
                    <input
                      type={inputType(column)}
                      value={formValues[column.name] ?? ""}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          [column.name]: event.target.value,
                        }))
                      }
                    />
                  )}
                </label>
              ))}

              <div className="view-db-form-actions">
                <button
                  type="button"
                  className="view-db-btn"
                  onClick={() => setFormMode(null)}
                  disabled={submitting}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="view-db-btn view-db-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
