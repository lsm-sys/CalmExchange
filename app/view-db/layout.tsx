import { Suspense } from "react";

export default function ViewDbLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <main className="view-db">
          <p className="view-db-muted">Загрузка...</p>
        </main>
      }
    >
      {children}
    </Suspense>
  );
}
