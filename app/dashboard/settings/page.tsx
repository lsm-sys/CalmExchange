import { Settings } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader title="Личный кабинет" subtitle="Настройки" />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-20 text-center">
        <Settings className="mb-4 h-10 w-10 text-muted-foreground/60" />
        <p className="text-lg font-medium">Скоро…</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Настройки профиля, уведомлений и приватности появятся в следующих
          версиях.
        </p>
      </div>
    </>
  );
}
