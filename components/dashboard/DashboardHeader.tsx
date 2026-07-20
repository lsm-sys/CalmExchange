type DashboardHeaderProps = {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
};

export function DashboardHeader({
  title,
  subtitle,
  actions,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <h2 className="mt-1 text-lg text-muted-foreground">{subtitle}</h2>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
