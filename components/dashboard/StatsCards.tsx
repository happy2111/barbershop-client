import { MetricCard } from "./MetricCard";
import { useDashboardStore } from "@/stores/dashboard.store";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Award,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

// Утилита для форматирования валюты UZS
const formatUZS = (value: number | undefined) => {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value).replace('UZS', 'сум');
};

export function StatsCards() {
  const {
    revenue,
    bookingsCount,
    averageCheck,
    lostMoney,
    repeatClients,
    bestSpecialist,
    isLoading,
  } = useDashboardStore();

  const cards = [
    {
      title: "Выручка",
      value: formatUZS(revenue?.revenue),
      subtitle: "За текущий месяц",
      icon: DollarSign,
      variant: "primary",
      loadingKey: "revenue_month",
    },
    {
      title: "Бронирования",
      value: bookingsCount?.count?.toString() ?? "—",
      subtitle: "Всего записей",
      icon: Calendar,
      variant: "blue",
      loadingKey: "bookingsCount_month",
    },
    {
      title: "Средний чек",
      value: formatUZS(averageCheck),
      subtitle: "На одного клиента",
      icon: TrendingUp,
      variant: "green",
      loadingKey: "averageCheck", // проверьте ключ в сторе
    },
    {
      title: "Упущенная выгода",
      value: formatUZS(lostMoney?.lost),
      subtitle: `${lostMoney?.count ?? 0} отмен за период`,
      icon: TrendingDown,
      variant: "destructive",
      loadingKey: "lostMoney",
    },
    {
      title: "Лояльность",
      value: repeatClients ? `${repeatClients.repeatPercent}%` : "—",
      subtitle: "Повторные визиты",
      icon: Users,
      variant: "purple",
      loadingKey: "repeatClients",
    },
    {
      title: "Топ специалист",
      value: bestSpecialist?.name ?? "—",
      subtitle: formatUZS(bestSpecialist?.value),
      icon: Award,
      variant: "orange",
      loadingKey: "bestSpecialist",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <MetricCard
          key={i}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
          // Мы можем передать вариант стиля, если ваш MetricCard это поддерживает
          className="hover:shadow-md transition-shadow duration-200"
          isLoading={isLoading[card.loadingKey] || false}
        />
      ))}
    </div>
  );
}