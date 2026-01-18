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

import { serviceCategoryService, ServiceCategory } from "@/services/service-category.service";
import { FolderOpen, Edit, Trash2, Plus, Search } from "lucide-react";
import ProtectedAdminRoute from "@/components/Pretecters&Providers/ProtectedAdminRoute";

export default function ServiceCategoriesPage() {
  const t = useTranslations("admin.service_categories");

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await serviceCategoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("errors.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t("errors.name_required"));
      return;
    }

    try {
      if (editingCategory) {
        await serviceCategoryService.update(editingCategory.id, { name: name.trim() });
        toast.success(t("toast.updated"));
      } else {
        await serviceCategoryService.create({ name: name.trim() });
        toast.success(t("toast.created"));
      }

      setDialogOpen(false);
      setName("");
      setEditingCategory(null);
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("errors.save_failed"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirm.delete"))) return;

    try {
      await serviceCategoryService.remove(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(t("toast.deleted"));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("errors.delete_failed"));
    }
  };

  const openDialog = (category?: ServiceCategory) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
    } else {
      setEditingCategory(null);
      setName("");
    }
    setDialogOpen(true);
  };

  // ─── Desktop Columns ───────────────────────────────────────────────────────
  const desktopColumns: ColumnDef<ServiceCategory>[] = [
    {
      accessorKey: "id",
      header: t("table.id"),
      size: 80,
    },
    {
      accessorKey: "name",
      header: t("table.name"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 font-medium">
          <FolderOpen className="w-5 h-5 text-muted-foreground" />
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "services.length",
      header: t("table.services_count"),
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-medium">
          {row.original.services?.length || 0}
        </Badge>
      ),
    },
    {
      id: "actions",
      size: 100,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDialog(row.original)}
            title={t("actions.edit")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive/90"
            onClick={() => handleDelete(row.original.id)}
            title={t("actions.delete")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: categories,
    columns: desktopColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: { sorting, globalFilter },
  });

  // ─── Mobile Card ───────────────────────────────────────────────────────────
  const CategoryCard = ({ category }: { category: ServiceCategory }) => (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium text-lg">{category.name}</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {category.services?.length || 0} {t("table.services")}
              </div>
            </div>
          </div>

          <Badge variant="secondary" className="text-base px-3 py-1">
            {category.services?.length || 0}
          </Badge>
        </div>

        <div className="flex max-sm:flex-col gap-3">
          <Button
            variant="outline"
            size="default"
            className="flex-1"
            onClick={() => openDialog(category)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {t("actions.edit")}
          </Button>
          <Button
            variant="outline"
            size="default"
            className="flex-1 text-destructive hover:text-destructive/90 border-destructive/30"
            onClick={() => handleDelete(category.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t("actions.delete")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto py-6 px-4 max-w-5xl">
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
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
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
                  {categories.length > 0 ? (
                    categories
                      .filter((c) =>
                        !globalFilter || c.name.toLowerCase().includes(globalFilter.toLowerCase())
                      )
                      .map((category) => <CategoryCard key={category.id} category={category} />)
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      {t("table.no_results")}
                    </div>
                  )}
                </div>
              </>
            )}

            {!loading && categories.length > 0 && (
              <div className="mt-6 text-sm text-muted-foreground text-center md:text-left">
                {t("table.total", { count: categories.length })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Модальное окно создания/редактирования */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? t("dialog.edit_title") : t("dialog.new_title")}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-base font-medium">
                  {t("form.name.label")}
                </Label>
                <Input
                  id="name"
                  placeholder={t("form.name.placeholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("buttons.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!name.trim()}
              >
                {editingCategory ? t("buttons.save") : t("buttons.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedAdminRoute>
  );
}