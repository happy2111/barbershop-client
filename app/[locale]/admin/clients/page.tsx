"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
import ProtectedAdminRoute from "@/components/Pretecters&Providers/ProtectedAdminRoute";

export default function ClientsPage() {
  const t = useTranslations("admin.clients");

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("errors.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.phone.trim()) {
      toast.error(t("errors.phone_required"));
      return;
    }

    try {
      if (editingClient) {
        await clientService.update(editingClient.id, {
          name: formData.name.trim() || undefined,
          phone: formData.phone.trim(),
        });
        toast.success(t("toast.updated"));
      } else {
        await clientService.create({
          name: formData.name.trim() || undefined,
          phone: formData.phone.trim(),
        });
        toast.success(t("toast.created"));
      }

      setDialogOpen(false);
      setFormData({ name: "", phone: "" });
      setEditingClient(null);
      loadClients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("errors.save_failed"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirm.delete"))) return;

    try {
      await clientService.remove(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success(t("toast.deleted"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("errors.delete_failed"));
    }
  };

  const openDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name || "",
        phone: client.phone || "",
      });
    } else {
      setEditingClient(null);
      setFormData({ name: "", phone: "" });
    }
    setDialogOpen(true);
  };

  // ─── Desktop Columns ───────────────────────────────────────────────────────
  const desktopColumns: ColumnDef<Client>[] = [
    {
      accessorKey: "id",
      header: t("table.id"),
      size: 80,
    },
    {
      accessorKey: "name",
      header: t("table.name"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">
            {row.original.name || t("table.name_unknown")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: t("table.phone"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-mono">
          <Phone className="w-4 h-4 text-muted-foreground" />
          {row.original.phone}
        </div>
      ),
    },
    {
      accessorKey: "bookings.length",
      header: t("table.bookings_count"),
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
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openDialog(client)}
              title={t("actions.edit")}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive/90"
              onClick={() => handleDelete(client.id)}
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
    <Card className="overflow-hidden border-none shadow-sm hover:shadow transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold text-lg">
                {client.name || t("table.name_unknown")}
              </div>
              <div className="text-sm font-mono text-muted-foreground mt-1">
                {client.phone}
              </div>
            </div>

            <Badge variant="outline" className="ml-3">
              {client.bookings?.length || 0} {t("table.bookings")}
            </Badge>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => openDialog(client)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t("actions.edit")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive/90 border-destructive/30"
              onClick={() => handleDelete(client.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("actions.delete")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <CardTitle className="text-2xl md:text-3xl font-bold">
                {t("title")}
              </CardTitle>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 md:flex-none md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("search.placeholder")}
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>

                <Button onClick={() => openDialog()} className="gap-2 w-full md:w-auto">
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
                {/* Desktop Table */}
                <div className="hidden md:block rounded-xl border overflow-hidden">
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
                  {clients.length > 0 ? (
                    clients
                      .filter(
                        (c) =>
                          !globalFilter ||
                          c.name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                          c.phone?.includes(globalFilter)
                      )
                      .map((client) => <ClientCard key={client.id} client={client} />)
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      {t("table.no_results")}
                    </div>
                  )}
                </div>
              </>
            )}

            {!loading && clients.length > 0 && (
              <div className="mt-6 text-sm text-muted-foreground text-center md:text-left">
                {t("table.total", { count: clients.length })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Модальное окно создания/редактирования */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? t("dialog.edit_title") : t("dialog.new_title")}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("form.name.label")}</Label>
                <Input
                  id="name"
                  placeholder={t("form.name.placeholder")}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="flex items-center gap-1">
                  {t("form.phone.label")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder={t("form.phone.placeholder")}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("buttons.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={!formData.phone.trim()}>
                {editingClient ? t("buttons.save") : t("buttons.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedAdminRoute>
  );
}