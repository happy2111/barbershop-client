// app/admin/bookings/page.tsx
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { bookingService, Booking, BookingStatus } from "@/services/booking.service";
import { MoreHorizontal, Search, Calendar, Clock, User, Scissors } from "lucide-react";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

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

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 70,
    },
    {
      accessorKey: "date",
      header: "Дата",
      cell: ({ row }: {row: any}) => {
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
      cell: ({ row }: {row: any}) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          {row.original.start_time} – {row.original.end_time}
        </div>
      ),
    },
    {
      accessorKey: "client",
      header: "Клиент",
      cell: ({ row }: {row: any}) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          {row.original.client?.name || "Имя не указано"}
        </div>
      ),
    },
    {
      accessorKey: "specialist",
      header: "Специалист",
      cell: ({ row }: {row: any}) => row.original.specialist?.name || "-",
    },
    {
      accessorKey: "service",
      header: "Услуга",
      cell: ({ row }: {row: any}) => (
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-muted-foreground" />
          {row.original.service?.name || "-"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }: {row: any}) => getStatusBadge(row.original.status),
    },
    {
      id: "actions",
      size: 80,
      cell: ({ row }: {row: any}) => {
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
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-2xl font-bold">Управление бронированиями</CardTitle>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Поиск по клиенту, телефону..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Select
                onValueChange={(value) =>
                  table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="PENDING">Ожидает</SelectItem>
                  <SelectItem value="CONFIRMED">Подтверждено</SelectItem>
                  <SelectItem value="CANCELLED">Отменено</SelectItem>
                  <SelectItem value="COMPLETED">Завершено</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup: any) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header: any) => (
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
                    table.getRowModel().rows.map((row: any) => (
                      <TableRow key={row.id} className="hover:bg-muted/50">
                        {row.getVisibleCells().map((cell: any) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                        Нет бронирований
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Всего бронирований: {bookings.length}
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedAdminRoute>
  );
}