"use client";

import { useEffect, useState } from "react";
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
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { bookingService, Booking, BookingStatus } from "@/services/booking.service";
import {
  MoreHorizontal,
  Search,
  Calendar,
  Clock,
  User,
  Scissors,
  PhoneCall,
} from "lucide-react";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import {AdminBookingModal} from "@/components/BookingModal";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getAll();
      setBookings(data);
    } catch (error) {
      toast.error("Не удалось загрузить бронирования");
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
      toast.success("Статус обновлён");
    } catch {
      toast.error("Ошибка при смене статуса");
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const variants: Record<BookingStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PENDING: { label: "Ожидает", variant: "secondary" },
      CONFIRMED: { label: "Подтверждено", variant: "default" },
      CANCELLED: { label: "Отменено", variant: "destructive" },
      COMPLETED: { label: "Завершено", variant: "outline" },
    };

    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  // ─── Desktop Table Columns ────────────────────────────────────────────────
  const desktopColumns: ColumnDef<Booking>[] = [
    { accessorKey: "id", header: "ID", size: 70 },
    {
      accessorKey: "date",
      header: "Дата",
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
      accessorKey: "start_time",
      header: "Время",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          {row.original.start_time} – {row.original.end_time}
        </div>
      ),
    },
    {
      accessorKey: "client",
      header: "Клиент",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          {row.original.client?.name || "—"}
        </div>
      ),
    },
    {
      accessorKey: "client.phone",
      header: "Телефон",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-muted-foreground" />
          {row.original.client?.phone || "—"}
        </div>
      ),
    },
    {
      accessorKey: "specialist",
      header: "Специалист",
      cell: ({ row }) => row.original.specialist?.name || "—",
    },
    {
      accessorKey: "service",
      header: "Услуга",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-muted-foreground" />
          {row.original.service?.name || "—"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: "actions",
      size: 80,
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => updateStatus(booking.id, BookingStatus.CONFIRMED)}
                disabled={booking.status === BookingStatus.CONFIRMED}
              >
                Подтвердить
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateStatus(booking.id, BookingStatus.COMPLETED)}
                disabled={booking.status === BookingStatus.COMPLETED}
              >
                Завершить
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateStatus(booking.id, BookingStatus.CANCELLED)}
                className="text-destructive"
                disabled={booking.status === BookingStatus.CANCELLED}
              >
                Отменить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <Card className="mb-4 overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">

            {/* Левая часть: Время и Статус (Акцент) */}
            <div className="bg-muted/30 p-4 sm:w-48 flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-dashed border-muted-foreground/20">
              <div className="text-2xl font-bold text-primary">
                {booking.start_time}
              </div>
              <div className="text-xs text-muted-foreground font-medium mb-2">
                до {booking.end_time}
              </div>
              {getStatusBadge(booking.status)}
            </div>

            {/* Правая часть: Основная информация */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-lg leading-tight truncate">
                    {booking.client?.name || "Клиент не указан"}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {booking.client?.phone || "—"}
                  </p>
                </div>

                {/* Кнопка действий вынесена в угол */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => updateStatus(booking.id, BookingStatus.CONFIRMED)}
                      disabled={booking.status === BookingStatus.CONFIRMED}
                    >
                      Подтвердить
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateStatus(booking.id, BookingStatus.COMPLETED)}
                      disabled={booking.status === BookingStatus.COMPLETED}
                    >
                      Завершить
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => updateStatus(booking.id, BookingStatus.CANCELLED)}
                      className="text-destructive focus:bg-destructive/10"
                      disabled={booking.status === BookingStatus.CANCELLED}
                    >
                      Отменить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Детали записи */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 pt-3 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground/60" />
                  <span className="font-medium">
                  {format(new Date(booking.date), "d MMMM", { locale: ru })}
                </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground/60" />
                  <span className="truncate">Мастер: <span className="font-medium">{booking.specialist?.name || "—"}</span></span>
                </div>

                <div className="flex items-center gap-2 text-sm col-span-1 md:col-span-2">
                  <Scissors className="w-4 h-4 text-muted-foreground/60" />
                  <span className="truncate italic text-muted-foreground">
                  {booking.service?.name || "Услуга не выбрана"}
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
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-2xl font-bold">Бронирования</CardTitle>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Поиск по имени, телефону..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>

                <Select
                  onValueChange={(value) =>
                    table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="PENDING">Ожидает</SelectItem>
                    <SelectItem value="CONFIRMED">Подтверждено</SelectItem>
                    <SelectItem value="CANCELLED">Отменено</SelectItem>
                    <SelectItem value="COMPLETED">Завершено</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setShowModal(true)}>Добавить</Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block rounded-md border">
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
                          <TableRow key={row.id} className="hover:bg-muted/50">
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
                            className="h-32 text-center text-muted-foreground"
                          >
                            Бронирования не найдены
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
                          globalFilter === "" ||
                          b.client?.name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                          b.client?.phone?.includes(globalFilter)
                      )
                      .map((booking) => <BookingCard key={booking.id} booking={booking} />)
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Бронирования не найдены
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AdminBookingModal isOpen={showModal} onClose={() => setShowModal(false)}/>
    </ProtectedAdminRoute>
  );
}