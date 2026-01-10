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
import {useDashboardStore} from "@/stores/dashboard.store";
import {Skeleton} from "@/components/ui/skeleton";

export function PopularServicesChart() {
  const {popularServices, isLoading} = useDashboardStore();
  // Предполагаем, что ключ загрузки соответствует вашим параметрам
  const loading = isLoading["popularServices_count_5"];

  const formatValue = (val: number) => {
    // Если это доход, форматируем как сум, если количество — просто число
    // В данном примере логика для 'count' (количества)
    return `${val} записей`;
  };

  return (
    <Card className="col-span-1 md:col-span-2 shadow-sm border-border/60">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Популярные услуги</CardTitle>
        <CardDescription>Топ-5 услуг по количеству записей</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] w-full">
        {loading || !popularServices ? (
          <Skeleton className="w-full h-full rounded-xl" />
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={popularServices}
              layout="vertical" // Горизонтальные бары удобнее для длинных названий
              margin={{top: 5, right: 30, left: 40, bottom: 5}}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
                opacity={0.4}
              />
              <XAxis
                type="number"
                hide // Прячем нижнюю ось для более чистого дизайна
              />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="var(--muted-foreground)"
                // Умная обрезка длинных названий
                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              />
              <Tooltip
                cursor={{fill: "var(--muted)", opacity: 0.3}}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value: any) => [formatValue(Number(value)), "Популярность"]}
                itemStyle={
                  {
                    color: `var(--chart-5})`
                  }
                }
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                barSize={32}
              >
                {popularServices.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`var(--chart-${(index % 5) + 1})`} // Разные цвета для каждой услуги
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