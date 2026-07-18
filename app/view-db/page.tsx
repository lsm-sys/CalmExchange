"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { DbTarget, TableListItem } from "@/lib/view-db/types";
import "./view-db.css";

export default function ViewDbHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [db, setDb] = useState<DbTarget>("local");
  const [tables, setTables] = useState<TableListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("db");
    if (fromUrl === "local" || fromUrl === "work") {
      setDb(fromUrl);
    }
  }, [searchParams]);

  const loadTables = useCallback(async (target: DbTarget) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/view-db/tables?db=${target}`);
      const payload = (await response.json()) as {
        tables?: TableListItem[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Не удалось загрузить таблицы.");
      }

      setTables(payload.tables ?? []);
    } catch (err) {
      setTables([]);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTables(db);
    router.replace(`/view-db?db=${db}`);
  }, [db, loadTables, router]);

  return (
    <main className="view-db">
      <header className="view-db-header">
        <div>
          <p className="view-db-kicker">view-db</p>
          <h1>Просмотр базы данных</h1>
          <p className="view-db-subtitle">
            Выберите локальную или рабочую БД, затем откройте таблицу.
          </p>
        </div>
        <Link href="/" className="view-db-link">
          На главную
        </Link>
      </header>

      <section className="view-db-panel">
        <h2>Источник данных</h2>
        <div className="view-db-segment">
          <button
            type="button"
            className={db === "local" ? "is-active" : ""}
            onClick={() => setDb("local")}
          >
            Локальная (.env)
          </button>
          <button
            type="button"
            className={db === "work" ? "is-active" : ""}
            onClick={() => setDb("work")}
          >
            Рабочая (WORK_DATABASE_URL)
          </button>
        </div>
        <p className="view-db-hint">
          {db === "local"
            ? "Используется DATABASE_URL из .env"
            : "Используется WORK_DATABASE_URL из .env"}
        </p>
      </section>

      <section className="view-db-panel">
        <div className="view-db-panel-head">
          <h2>Таблицы</h2>
          <button
            type="button"
            className="view-db-btn"
            onClick={() => void loadTables(db)}
            disabled={loading}
          >
            Обновить
          </button>
        </div>

        {error ? <p className="view-db-error">{error}</p> : null}
        {loading ? <p className="view-db-muted">Загрузка...</p> : null}

        {!loading && !error && tables.length === 0 ? (
          <p className="view-db-muted">Таблицы не найдены.</p>
        ) : null}

        {!loading && tables.length > 0 ? (
          <ul className="view-db-table-list">
            {tables.map((table) => (
              <li key={table.name} className="view-db-table-item">
                <div>
                  <strong>{table.name}</strong>
                  <span className="view-db-muted">{table.rowCount} строк</span>
                </div>
                <Link
                  href={`/view-db/${encodeURIComponent(table.name)}?db=${db}`}
                  className="view-db-btn view-db-btn-primary"
                >
                  Открыть
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
