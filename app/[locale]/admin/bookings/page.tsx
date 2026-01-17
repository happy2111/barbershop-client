"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import {
  bookingService,
  Booking,
  BookingStatus,
  PaginationMeta
} from "@/services/booking.service";
import {
  MoreHorizontal,
  Search,
  Calendar,
  Clock,
  User,
  Scissors,
  Phone,
  Plus, Trash2,
} from "lucide-react";
import ProtectedAdminRoute from "@/components/Pretecters&Providers/ProtectedAdminRoute";
import { AdminBookingModal } from "@/components/BookingModal";
import SlideToTop from "@/components/SlideToTop";
import {PaginationCustom} from "@/components/PaginationCustom";
import {clientService} from "@/services/client.service";

export default function BookingsPage() {
  const t = useTranslations("admin.bookings");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadBookings(page, limit);
  }, [page, limit]);

  const loadBookings = async (targetPage: number, targetLimit: number) => {
    setLoading(true);
    try {
      const response = await bookingService.getAll(targetPage, targetLimit);

      setBookings(response.data);
      setMeta(response.meta);
    } catch (error) {
      toast.error(t("errors.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: BookingStatus) => {
    try {
      await bookingService.updateStatus(id, status);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
      toast.success(t("toast.status_updated"));
    } catch {
      toast.error(t("toast.status_update_failed"));
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const variants: Record<
      BookingStatus,
      { labelKey: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      PENDING: { labelKey: "status.pending", variant: "secondary" },
      CONFIRMED: { labelKey: "status.confirmed", variant: "default" },
      CANCELLED: { labelKey: "status.cancelled", variant: "destructive" },
      COMPLETED: { labelKey: "status.completed", variant: "outline" },
    };

    const { labelKey, variant } = variants[status];
    return <Badge variant={variant}>{t(labelKey)}</Badge>;
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirm.delete"))) return;

    try {
      await bookingService.remove(id);
      setBookings((prev) => prev.filter((c) => c.id !== id));
      toast.success(t("toast.deleted"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("errors.delete_failed"));
    }
  };

  // ─── Desktop Columns ───────────────────────────────────────────────────────
  const desktopColumns: ColumnDef<Booking>[] = [
    {
      accessorKey: "id",
      header: t("table.id"),
      size: 80,
    },

    {
      accessorKey: "date",
      header: t("table.date"),
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {format(date, "d MMMM yyyy", { locale: ru })}
          </div>
        );
      },
    },

    {
      id: "time",
      header: t("table.time"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          {row.original.start_time} – {row.original.end_time}
        </div>
      ),
    },

    {
      id: "client",
      header: t("table.client"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          {row.original.client?.name || t("table.unknown")}
        </div>
      ),
    },

    {
      id: "phone",
      header: t("table.phone"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          {row.original.client?.phone || "—"}
        </div>
      ),
    },

    {
      id: "specialist",
      header: t("table.specialist"),
      cell: ({ row }) =>
        row.original.specialist?.name || t("table.unknown"),
    },

    {
      id: "services",
      header: t("table.service"),
      cell: ({ row }) => {
        const services = row.original.services ?? [];

        if (services.length === 0) {
          return <span className="text-muted-foreground">—</span>;
        }

        if (services.length === 1) {
          return (
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-muted-foreground" />
              {services[0].service.name}
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-muted-foreground" />
            {services[0].service.name}
            <span className="text-xs text-muted-foreground">
            +{services.length - 1}
          </span>
          </div>
        );
      },
    },

    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => getStatusBadge(row.original.status),
    },

    {
      id: "actions",
      size: 80,
      cell: ({ row }) => {
        const booking = row.original;

        return (
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    updateStatus(booking.id, BookingStatus.CONFIRMED)
                  }
                  disabled={booking.status === BookingStatus.CONFIRMED}
                >
                  {t("actions.confirm")}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    updateStatus(booking.id, BookingStatus.COMPLETED)
                  }
                  disabled={booking.status === BookingStatus.COMPLETED}
                >
                  {t("actions.complete")}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() =>
                    updateStatus(booking.id, BookingStatus.CANCELLED)
                  }
                  className="text-destructive focus:bg-destructive/10"
                  disabled={booking.status === BookingStatus.CANCELLED}
                >
                  {t("actions.cancel")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive/90"
              onClick={() => handleDelete(booking.id)}
              title={t("actions.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];


  const table = useReactTable({
    data: bookings,
    columns: desktopColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  // ─── Mobile Card ───────────────────────────────────────────────────────────
  const BookingCard = ({ booking }: { booking: Booking }) => {
    return (
      <Card className="overflow-hidden border-none shadow-sm hover:shadow transition-shadow">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Время + статус */}
            <div className="bg-muted/40 p-5 sm:w-44 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r">
              <div className="text-3xl font-bold text-primary">
                {booking.start_time}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                → {booking.end_time}
              </div>
              <div className="mt-3">{getStatusBadge(booking.status)}</div>
            </div>

            {/* Основная информация */}
            <div className="flex-1 p-5">
              <div className="flex justify-between items-start gap-3 mb-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {booking.client?.name || t("table.unknown")}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono mt-0.5">
                    {booking.client?.phone || "—"}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => updateStatus(booking.id, BookingStatus.CONFIRMED)}
                      disabled={booking.status === BookingStatus.CONFIRMED}
                    >
                      {t("actions.confirm")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateStatus(booking.id, BookingStatus.COMPLETED)}
                      disabled={booking.status === BookingStatus.COMPLETED}
                    >
                      {t("actions.complete")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => updateStatus(booking.id, BookingStatus.CANCELLED)}
                      className="text-destructive"
                      disabled={booking.status === BookingStatus.CANCELLED}
                    >
                      {t("actions.cancel")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {format(new Date(booking.date), "d MMMM yyyy", { locale: ru })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">
                    {t("table.specialist")}: {booking.specialist?.name || t("table.unknown")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate italic">
                  {booking.services && booking.services.length > 0
                      ? booking.services.map(s => s.service.name).join(", ")
                      : t("table.unknown")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <CardTitle className="text-2xl md:text-3xl font-bold">
                {t("title")}
              </CardTitle>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder={t("search.placeholder")}
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  onValueChange={(value) =>
                    table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder={t("filter.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("filter.all")}</SelectItem>
                    <SelectItem value="PENDING">{t("status.pending")}</SelectItem>
                    <SelectItem value="CONFIRMED">{t("status.confirmed")}</SelectItem>
                    <SelectItem value="CANCELLED">{t("status.cancelled")}</SelectItem>
                    <SelectItem value="COMPLETED">{t("status.completed")}</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => setShowModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t("buttons.add_new")}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-28 md:h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                {meta && (
                  <PaginationCustom
                    currentPage={page}
                    lastPage={meta.lastPage}
                    total={meta.total}
                    onPageChange={(newPage: number) => setPage(newPage)}
                  />
                )}
                {/* Desktop Table */}
                <div className="hidden md:block rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              style={{ width: header.getSize() }}
                              className="font-semibold"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} className="hover:bg-muted/60">
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={desktopColumns.length}
                            className="h-48 text-center text-muted-foreground"
                          >
                            {t("table.no_results")}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {bookings.length > 0 ? (
                    bookings
                      .filter(
                        (b) =>
                          !globalFilter ||
                          b.client?.name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                          b.client?.phone?.includes(globalFilter)
                      )
                      .map((booking) => <BookingCard key={booking.id} booking={booking} />)
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      {t("table.no_results")}
                    </div>
                  )}
                </div>

                {meta && (
                  <PaginationCustom
                    currentPage={page}
                    lastPage={meta.lastPage}
                    total={meta.total}
                    onPageChange={(newPage: number) => setPage(newPage)}
                  />
                )}
              </>
            )}
          </CardContent>

        </Card>
      </div>

      <AdminBookingModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        onCreated={() => {
          loadBookings(page, limit);
        }}
      />

      <SlideToTop/>
    </ProtectedAdminRoute>
  );
}