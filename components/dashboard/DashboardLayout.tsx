import {useTranslations} from "next-intl";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const t = useTranslations('admin.dashboard');
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("description")}
        </p>
      </div>
      {children}
    </div>
  );
}