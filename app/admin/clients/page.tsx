"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { clientService, Client } from "@/services/client.service";
import { Phone, User, Search, Edit, Trash2, Plus } from "lucide-react";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Не удалось загрузить клиентов");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.phone.trim()) {
      toast.error("Телефон обязателен");
      return;
    }

    try {
      if (editingClient) {
        await clientService.update(editingClient.id, {
          name: formData.name || undefined,
          phone: formData.phone.trim(),
        });
        toast.success("Клиент обновлён");
      } else {
        await clientService.create({
          name: formData.name || undefined,
          phone: formData.phone.trim(),
        });
        toast.success("Клиент создан");
      }

      setOpen(false);
      setFormData({ name: "", phone: "" });
      loadClients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Ошибка при сохранении");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить клиента? Это действие нельзя отменить.")) return;

    try {
      await clientService.remove(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Клиент удалён");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Не удалось удалить");
    }
  };

  const openEdit = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({ name: client.name || "", phone: client.phone || "" });
    } else {
      setEditingClient(null);
      setFormData({ name: "", phone: "" });
    }
    setOpen(true);
  };

  // ─── Desktop Columns ───────────────────────────────────────────────────────
  const desktopColumns: ColumnDef<Client>[] = [
    { accessorKey: "id", header: "ID", size: 80 },
    {
      accessorKey: "name",
      header: "Имя",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">
            {row.original.name || <span className="text-muted-foreground">Не указано</span>}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Телефон",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-mono">
          <Phone className="w-4 h-4 text-muted-foreground" />
          {row.original.phone}
        </div>
      ),
    },
    {
      accessorKey: "bookings",
      header: "Бронирований",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-medium">
          {row.original.bookings?.length || 0}
        </Badge>
      ),
    },
    {
      id: "actions",
      size: 120,
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => openEdit(client)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive/90"
              onClick={() => handleDelete(client.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: clients,
    columns: desktopColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      globalFilter,
    },
  });

  // ─── Mobile Card ───────────────────────────────────────────────────────────
  const ClientCard = ({ client }: { client: Client }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-wrap justify-between items-start my-4">
          <div>
            <div className="font-medium text-lg">
              {client.name || "Имя не указано"}
            </div>
            <div className="text-sm font-mono text-muted-foreground mt-1">
              {client.phone}
            </div>
          </div>

          <Badge variant="outline">
            {client.bookings?.length || 0} бронирований
          </Badge>
        </div>

        <div className="flex gap-3 mt-4 flex-wrap">
          <Button variant="outline" size="sm"
                  className="flex-1"
                  onClick={() => openEdit(client)}>
            <Edit className="h-4 w-4 mr-2" />
            Редактировать
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive/90 flex-1 border-destructive/30"
            onClick={() => handleDelete(client.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-2xl font-bold">Клиенты</CardTitle>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по имени или телефону..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-10 w-full sm:w-72"
                  />
                </div>

                <Button onClick={() => openEdit()} className="gap-2 w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                  Новый клиент
                </Button>
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
                              className="font-semibold cursor-pointer select-none"
                              onClick={header.column.getToggleSortingHandler()}
                              style={{ width: header.getSize() }}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getIsSorted() && (
                                <span className="ml-2">
                                  {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
                                </span>
                              )}
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
                            Клиентов пока нет
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {clients.length > 0 ? (
                    clients
                      .filter(
                        (c) =>
                          globalFilter === "" ||
                          c.name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                          c.phone?.includes(globalFilter)
                      )
                      .map((client) => <ClientCard key={client.id} client={client} />)
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Клиентов пока нет
                    </div>
                  )}
                </div>
              </>
            )}

            {!loading && (
              <div className="mt-6 text-sm text-muted-foreground text-center md:text-left">
                Всего клиентов: {clients.length}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Модальное окно */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Редактировать клиента" : "Новый клиент"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Имя (необязательно)</Label>
                <Input
                  id="name"
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  placeholder="+7 (999) 123-45-67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSave}>
                {editingClient ? "Сохранить" : "Создать"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedAdminRoute>
  );
}