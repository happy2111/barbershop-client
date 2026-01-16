"use client";

import { useTranslations } from "next-intl";
import { MetricCard } from "./MetricCard";
import { useDashboardStore } from "@/stores/dashboard.store";
import { DollarSign, Calendar, TrendingUp, TrendingDown, Users, Award } from "lucide-react";

export function StatsCards() {
  const t = useTranslations("admin.dashboard.stats");
  const common = useTranslations("common");

  const {
    revenue, bookingsCount, averageCheck, lostMoney,
    repeatClients, bestSpecialist, isLoading,
  } = useDashboardStore();

  const formatUZS = (value: number | null | undefined) => {
    if (value === undefined || value === null) return "—";
    return new Intl.NumberFormat('ru-RU').format(value) + ` ${common('sum')}`;
  };

  const cards = [
    {
      title: t("revenue"),
      value: formatUZS(revenue?.revenue),
      subtitle: t("revenue_subtitle"),
      icon: DollarSign,
      loadingKey: "revenue_month",
    },
    {
      title: t("bookings"),
      value: bookingsCount?.count?.toString() ?? "—",
      subtitle: t("bookings_subtitle"),
      icon: Calendar,
      loadingKey: "bookingsCount_month",
    },
    {
      title: t("avg_check"),
      value: formatUZS(averageCheck),
      subtitle: t("avg_check_subtitle"),
      icon: TrendingUp,
      loadingKey: "averageCheck",
    },
    {
      title: t("lost_profit"),
      value: formatUZS(lostMoney?.lost),
      subtitle: t("lost_profit_subtitle", { count: lostMoney?.count ?? 0 }),
      icon: TrendingDown,
      loadingKey: "lostMoney",
    },
    {
      title: t("loyalty"),
      value: repeatClients ? `${repeatClients.repeatPercent}%` : "—",
      subtitle: t("loyalty_subtitle"),
      icon: Users,
      loadingKey: "repeatClients",
    },
    {
      title: t("top_specialist"),
      value: bestSpecialist?.name ?? "—",
      subtitle: formatUZS(bestSpecialist?.value),
      icon: Award,
      loadingKey: "bestSpecialist",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <MetricCard
          key={i}
          {...card}
          isLoading={isLoading[card.loadingKey] || false}
        />
      ))}
    </div>
  );
}