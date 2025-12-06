// app/admin/services-categories/page.tsx
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

import { serviceCategoryService, ServiceCategory } from "@/services/service-category.service";
import { FolderOpen, Edit, Trash2, Plus, Search } from "lucide-react";

export default function ServiceCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Модалка
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await serviceCategoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      toast.error("Не удалось загрузить категории");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Введите название категории");
      return;
    }

    try {
      if (editingCategory) {
        await serviceCategoryService.update(editingCategory.id, { name: name.trim() });
        toast.success("Категория обновлена");
      } else {
        await serviceCategoryService.create({ name: name.trim() });
        toast.success("Категория создана");
      }
      setOpen(false);
      setName("");
      setEditingCategory(null);
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Ошибка сохранения");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить категорию? Все услуги в ней останутся без категории.")) return;

    try {
      await serviceCategoryService.remove(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Категория удалена");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Не удалось удалить");
    }
  };

  const openEdit = (category?: ServiceCategory) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
    } else {
      setEditingCategory(null);
      setName("");
    }
    setOpen(true);
  };

  const columns: ColumnDef<ServiceCategory>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 80,
    },
    {
      accessorKey: "name",
      header: "Название категории",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 font-medium">
          <FolderOpen className="w-5 h-5 text-muted-foreground" />
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "services",
      header: "Услуг",
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
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row.original)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
  });

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-2xl font-bold">Категории услуг</CardTitle>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <Button onClick={() => openEdit()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Новая категория
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="font-semibold cursor-pointer select-none"
                            onClick={header.column.getToggleSortingHandler()}
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
                        <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                          Категорий пока нет
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground">
              Всего категорий: {categories.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Модальное окно */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Редактировать категорию" : "Новая категория"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название категории</Label>
              <Input
                id="name"
                placeholder="Например: Стрижки, Окрашивание, Уход"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              {editingCategory ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}