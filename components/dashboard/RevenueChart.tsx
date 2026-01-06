import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";
import { useDashboardStore } from "@/stores/dashboard.store";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export function RevenueChart() {
  const { revenueGraph, isLoading } = useDashboardStore();
  const isGraphLoading = isLoading["revenueGraph_30"];

  // Вычисляем общую сумму для заголовка
  const totalRevenue = useMemo(() => {
    return revenueGraph?.reduce((acc, curr) => acc + curr.value, 0) || 0;
  }, [revenueGraph]);

  const formatUZS = (val: number) =>
    new Intl.NumberFormat('ru-RU').format(val) + " сум";

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-4 shadow-sm border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">Динамика выручки</CardTitle>
          <CardDescription>Общий доход за последние 30 дней</CardDescription>
        </div>
        {!isGraphLoading && (
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatUZS(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Итого за период</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="h-[350px] w-full pl-0">
        {isGraphLoading || !revenueGraph ? (
          <div className="px-6 h-full w-full">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueGraph}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                minTickGap={30}
                tickFormatter={(value) => format(parseISO(value), "d MMM", { locale: ru })}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                fontSize={12}
                stroke="var(--muted-foreground)"
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                cursor={{ stroke: "var(--chart-1)", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
                labelFormatter={(label) => format(parseISO(label), "d MMMM yyyy", { locale: ru })}
                formatter={(value: any) => [formatUZS(Number(value)), "Выручка"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-1)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}