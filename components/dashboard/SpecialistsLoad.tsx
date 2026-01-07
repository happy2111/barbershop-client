import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboardStore } from "@/stores/dashboard.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"; // Убедитесь, что этот компонент есть в shadcn
import { User2 } from "lucide-react";

export function SpecialistsLoad() {
  const { specialistsLoad, isLoading } = useDashboardStore();
  const loading = isLoading["specialistsLoad_month"];

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'high': return { label: 'Перегрузка', variant: 'destructive' as const };
      case 'low': return { label: 'Свободен', variant: 'secondary' as const };
      default: return { label: 'Оптимально', variant: 'outline' as const };
    }
  };

  return (
    <Card className="lg:col-span-2 shadow-sm border-border/60">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Загрузка мастеров</CardTitle>
        <CardDescription>Эффективность работы команды за месяц</CardDescription>
      </CardHeader>
      <CardContent className="space-y-7">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-12" /></div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))
        ) : specialistsLoad?.length ? (
          specialistsLoad.map((spec) => {
            const { label, variant } = getStatusDetails(spec.status);
            return (
              <div key={spec.id} className="group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                      <User2 size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">{spec.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {spec.bookedHours}ч из {spec.totalHours}ч отработано
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold">{spec.load}%</span>
                    <Badge variant={variant} className="text-[10px] uppercase px-1.5 py-0 h-4">
                      {label}
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={spec.load}
                  className="h-2 bg-muted"
                />
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-muted-foreground">Данные отсутствуют</div>
        )}
      </CardContent>
    </Card>
  );
}