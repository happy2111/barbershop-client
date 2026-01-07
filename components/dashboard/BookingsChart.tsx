import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useDashboardStore } from "@/stores/dashboard.store";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export function BookingsChart() {
  const { bookingsGraph, isLoading } = useDashboardStore();
  const isGraphLoading = isLoading["bookingsGraph_30"];

  // Вычисляем общую сумму броней и среднее значение
  const stats = useMemo(() => {
    if (!bookingsGraph?.length) return { total: 0, avg: 0 };
    const total = bookingsGraph.reduce((acc, curr) => acc + curr.value, 0);
    const avg = (total / bookingsGraph.length).toFixed(1);
    return { total, avg };
  }, [bookingsGraph]);

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-4 shadow-sm border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">Количество бронирований</CardTitle>
          <CardDescription>Активность клиентов за 30 дней</CardDescription>
        </div>
        {!isGraphLoading && (
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-chart-2">{stats.total}</div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Всего</p>
            </div>
            <div className="text-right border-l pl-4">
              <div className="text-2xl font-bold text-muted-foreground">{stats.avg}</div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">В день</p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="h-[350px] w-full pl-0">
        {isGraphLoading || !bookingsGraph ? (
          <div className="px-6 h-full w-full">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bookingsGraph}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              barGap={8}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
                opacity={0.4}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                minTickGap={25}
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
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
                labelFormatter={(label) => format(parseISO(label), "d MMMM yyyy (EEEE)", { locale: ru })}
                formatter={(value: any) => [`${value} записей`, "Бронирования"]}
              />
              <Bar
                dataKey="value"
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              >
                {bookingsGraph.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    // Можно подсветить выходные другим цветом (опционально)
                    fillOpacity={entry.value === 0 ? 0.3 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}