"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDashboardStore } from "@/stores/dashboard.store";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ru, uz } from "date-fns/locale"; // Импортируем нужные локали

export function RevenueChart() {
  const t = useTranslations("admin.dashboard");
  const common = useTranslations("common");
  const locale = useLocale();

  const dateLocale = locale === 'uz' ? uz : ru;

  const { revenueGraph, isLoading } = useDashboardStore();
  const isGraphLoading = isLoading["revenueGraph_30"];

  const totalRevenue = useMemo(() =>
      revenueGraph?.reduce((acc, curr) => acc + curr.value, 0) || 0,
    [revenueGraph]);

  const formatUZS = (val: number) =>
    new Intl.NumberFormat(locale === 'uz' ? 'uz-UZ' : 'ru-RU').format(val) + ` ${common('sum')}`;

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-4 shadow-sm border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">{t('charts.revenue_title')}</CardTitle>
          <CardDescription>{t('charts.revenue_description')}</CardDescription>
        </div>
        {!isGraphLoading && (
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{formatUZS(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{t('stats.total_period')}</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="h-[350px] w-full pl-0">
        {isGraphLoading || !revenueGraph ? (
          <div className="px-6 h-full w-full"><Skeleton className="w-full h-full rounded-xl" /></div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueGraph} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                tickFormatter={(val) => format(parseISO(val), "d MMM", { locale: dateLocale })}
                // ...остальные пропсы
              />
              <Tooltip
                cursor={{ stroke: "var(--chart-1)", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
                labelFormatter={(label) => format(parseISO(label), "d MMMM yyyy", { locale: dateLocale })}
                formatter={(value: any) => [formatUZS(Number(value)), t('charts.tooltip_revenue')]}
              />
              <Area strokeWidth={3}
                    fillOpacity={1} type="monotone" dataKey="value" stroke="var(--chart-1)" fill="url(#colorValue)" />
              {/* Оставлен оригинальный дизайн градиентов и сеток */}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}