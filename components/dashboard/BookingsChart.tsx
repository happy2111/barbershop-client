"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from "recharts";
import { useDashboardStore } from "@/stores/dashboard.store";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ru, uz } from "date-fns/locale";

export function BookingsChart() {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const dateLocale = locale === 'uz' ? uz : ru;

  const { bookingsGraph, isLoading } = useDashboardStore();
  const isGraphLoading = isLoading["bookingsGraph_30"];

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
          <CardTitle className="text-xl font-bold">{t('charts.bookings_title')}</CardTitle>
          <CardDescription>{t('charts.bookings_description')}</CardDescription>
        </div>
        {!isGraphLoading && (
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-chart-2">{stats.total}</div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('stats.total')}</p>
            </div>
            <div className="text-right border-l pl-4">
              <div className="text-2xl font-bold text-muted-foreground">{stats.avg}</div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('stats.per_day')}</p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="h-[350px] w-full pl-0">
        {isGraphLoading || !bookingsGraph ? (
          <div className="px-6 h-full w-full"><Skeleton className="w-full h-full rounded-xl" /></div>
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
                tickFormatter={(val) => format(parseISO(val), "d MMM", { locale: dateLocale })}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
                labelFormatter={(label) => format(parseISO(label), "d MMMM yyyy (EEEE)", { locale: dateLocale })}
                formatter={(value: any) => [t('charts.tooltip_bookings', { value }), t('stats.bookings')]}
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