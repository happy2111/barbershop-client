// app/admin/services/page.tsx
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { serviceService, Service } from "@/services/service.service";
import { serviceCategoryService } from "@/services/service-category.service"; // создадим ниже
import { Clock, DollarSign, Edit, Trash2, Plus, Image as ImageIcon, Search } from "lucide-react";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

interface ServiceCategory {
  id: number;
  name: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Модалка
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    duration_min: "",
    categoryId: "",
    photo: null as File | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesData, categoriesData] = await Promise.all([
        serviceService.getAll(),
        serviceCategoryService.getAll(),
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (err) {
      toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    // Валидация на фронте
    if (!form.name.trim()) return toast.error("Введите название");
    if (!form.price || Number(form.price) <= 0) return toast.error("Укажите корректную цену");
    if (!form.duration_min || Number(form.duration_min) < 1) return toast.error("Длительность ≥ 1 мин");
    if (!form.categoryId) return toast.error("Выберите категорию");

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      duration_min: Number(form.duration_min),
      categoryId: Number(form.categoryId),
    };

    try {
      if (editingService) {
        // UPDATE — можно и JSON, и FormData (у тебя уже работает)
        if (form.photo) {
          const fd = new FormData();
          Object.entries(payload).forEach(([k, v]) => fd.append(k, v.toString()));
          fd.append("photo", form.photo);
          await serviceService.update(editingService.id, fd);
        } else {
          await serviceService.update(editingService.id, payload);
        }
        toast.success("Услуга обновлена");
      } else {
        // CREATE — ВСЕГДА FormData (иначе NestJS ругается)
        const fd = new FormData();
        fd.append("name", payload.name);
        fd.append("price", payload.price.toString());
        fd.append("duration_min", payload.duration_min.toString());
        fd.append("categoryId", payload.categoryId.toString());

        if (form.photo) {
          fd.append("photo", form.photo);
        }
        // ← Даже если фото нет — отправляем FormData (пустое поле photo)

        await serviceService.create(fd);
        toast.success("Услуга создана");
      }

      setOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      console.error(err.response?.data);
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        toast.error(msg.join(" • "));
      } else {
        toast.error(msg || "Ошибка сохранения");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить услугу?")) return;
    try {
      await serviceService.remove(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success("Услуга удалена");
    } catch {
      toast.error("Не удалось удалить");
    }
  };

  const openEdit = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setForm({
        name: service.name,
        price: service.price.toString(),
        duration_min: service.duration_min.toString(),
        categoryId: service.categoryId.toString(),
        photo: null,
      });
      setPhotoPreview(service.photo || null);
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const resetForm = () => {
    setEditingService(null);
    setForm({ name: "", price: "", duration_min: "", categoryId: "", photo: null });
    setPhotoPreview(null);
  };

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "photo",
      header: "Фото",
      size: 90,
      cell: ({ row }) => (
        <div className="w-16 h-16 rounded-md overflow-hidden border">
          {row.original.photo ? (
            <img src={`${process.env.NEXT_PUBLIC_API_URL}${row.original.photo}`} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "category",
      header: "Категория",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.category?.name || "—"}</Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "Цена",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-medium">
          {row.original.price.toLocaleString()} сум
        </div>
      ),
    },
    {
      accessorKey: "duration_min",
      header: "Длительность",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-muted-foreground" />
          {row.original.duration_min} мин
        </div>
      ),
    },
    {
      id: "actions",
      size: 100,
      cell: ({ row }) => (
        <div className="flex gap-2">
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
    data: services,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
  });

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-2xl font-bold">Услуги</CardTitle>
              <div className="flex flex-wrap items-center gap-4">
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
                  Новая услуга
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
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
                              <span className="ml-1">{header.column.getIsSorted() === "asc" ? "↑" : "↓"}</span>
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
                          Услуг пока нет
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              Всего услуг: {services.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Модалка создания/редактирования */}
      <Dialog open={open} onOpenChange={(v) => !v && resetForm() || setOpen(v)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingService ? "Редактировать услугу" : "Новая услуга"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Название *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Стрижка мужская"
                />
              </div>
              <div className="space-y-2">
                <Label>Цена *</Label>
                <Input
                  type="number"
                  min="1"
                  step="any"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Длительность (мин) *</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.duration_min}
                  onChange={(e) => setForm({ ...form, duration_min: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Категория *</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Фото</Label>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" asChild>
                  <label className="cursor-pointer">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Выбрать фото
                    <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                  </label>
                </Button>
                {photoPreview && (
                  <img src={photoPreview} alt="Preview" className="h-20 w-20 object-cover rounded-md border" />
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              {editingService ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedAdminRoute>
  );
}