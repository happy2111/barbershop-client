"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { useDashboardStore } from "@/stores/dashboard.store";
import { Skeleton } from "@/components/ui/skeleton";

export function PopularServicesChart() {
  const { popularServices, isLoading } = useDashboardStore();
  const loading = isLoading["popularServices_count_5"];

  // Инициализация перевода
  const t = useTranslations("admin.dashboard.popular_services");

  const formatValue = (val: number) => {
    // Используем интерполяцию для вывода количества записей
    return t('record_count', { count: val });
  };

  return (
    <Card className="col-span-1 md:col-span-2 shadow-sm border-border/60">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] w-full">
        {loading || !popularServices ? (
          <Skeleton className="w-full h-full rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={popularServices}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
                opacity={0.4}
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="var(--muted-foreground)"
                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value: any) => [formatValue(Number(value)), t('popularity')]}
                itemStyle={{ color: `var(--chart-5)` }}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                barSize={32}
              >
                {popularServices.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`var(--chart-${(index % 5) + 1})`}
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