'use client'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { BookingsChart } from "@/components/dashboard/BookingsChart";
import { SpecialistsLoad } from "@/components/dashboard/SpecialistsLoad";
import { PopularServicesChart } from "@/components/dashboard/PopularServicesChart";
import { useEffect } from "react";
import { useDashboardStore } from "@/stores/dashboard.store";

export default function DashboardPage() {
  const {
    fetchRevenue,
    fetchRevenueGraph,
    fetchBookingsCount,
    fetchBookingsGraph,
    fetchSpecialistsLoad,
    fetchPopularServices,
    fetchLostMoney,
    fetchRepeatClients,
    fetchBestSpecialist,
    fetchAverageCheck,
    fetchPeakHours,
  } = useDashboardStore();

  useEffect(() => {
    // Загружаем все данные при монтировании
    Promise.all([
      fetchRevenue("month"),
      fetchRevenueGraph(30),
      fetchBookingsCount("month"),
      fetchBookingsGraph(30),
      fetchSpecialistsLoad("month"),
      fetchPopularServices(5, "count"),
      fetchLostMoney(),
      fetchRepeatClients(),
      fetchBestSpecialist("revenue"),
      fetchAverageCheck(),
      fetchPeakHours(),
    ]);
  }, [
    fetchRevenue,
    fetchRevenueGraph,
    fetchBookingsCount,
    fetchBookingsGraph,
    fetchSpecialistsLoad,
    fetchPopularServices,
    fetchLostMoney,
    fetchRepeatClients,
    fetchBestSpecialist,
    fetchAverageCheck,
    fetchPeakHours,
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <StatsCards />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <BookingsChart />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SpecialistsLoad />
          <PopularServicesChart />
          <div className="lg:col-span-1" />
        </div>
      </div>
    </DashboardLayout>
  );
}