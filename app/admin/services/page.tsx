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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { serviceService, Service } from "@/services/service.service";
import { serviceCategoryService } from "@/services/service-category.service";
import {
  Clock, DollarSign, Edit, Trash2, Plus, Image as ImageIcon, Search,
  Camera
} from "lucide-react";
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
    } catch {
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
        const fd = new FormData();
        fd.append("name", payload.name);
        fd.append("price", payload.price.toString());
        fd.append("duration_min", payload.duration_min.toString());
        fd.append("categoryId", payload.categoryId.toString());
        if (form.photo) fd.append("photo", form.photo);

        await serviceService.create(fd);
        toast.success("Услуга создана");
      }

      setOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(" • ") : msg || "Ошибка сохранения");
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
        categoryId: service.categoryId?.toString() || "",
        photo: null,
      });
      setPhotoPreview(service.photo ? `${process.env.NEXT_PUBLIC_API_URL}${service.photo}` : null);
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

  // ─── Desktop Columns ───────────────────────────────────────────────────────
  const desktopColumns: ColumnDef<Service>[] = [
    {
      accessorKey: "photo",
      header: "Фото",
      size: 90,
      cell: ({ row }) => (
        <div className="w-16 h-16 rounded-md overflow-hidden border">
          {row.original.photo ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${row.original.photo}`}
              alt={row.original.name}
              className="w-full h-full object-cover"
            />
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
        <div className="font-medium">{row.original.price.toLocaleString()} сум</div>
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
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive/90"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: services,
    columns: desktopColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: { sorting, globalFilter },
  });

  // ─── Mobile Card ───────────────────────────────────────────────────────────
  const ServiceCard = ({ service }: { service: Service }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          {/* Фото слева */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-lg overflow-hidden border">
              {service.photo ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${service.photo}`}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Основная информация */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-lg mb-1 line-clamp-2">{service.name}</div>

            <div className="text-sm text-muted-foreground mb-2">
              {service.category?.name || "Без категории"}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="flex items-center gap-1.5">
                <span>{service.price.toLocaleString()} сум</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{service.duration_min} мин</span>
              </div>
            </div>


          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => openEdit(service)}
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Редактировать
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:text-destructive/90 border-destructive/30"
            onClick={() => handleDelete(service.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
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
              <CardTitle className="text-2xl font-bold">Услуги</CardTitle>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>

                <Button onClick={() => openEdit()} className="gap-2 w-full sm:w-auto">
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
                  <Skeleton key={i} className="h-40 w-full rounded-lg" />
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
                                <span className="ml-1">
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
                            Услуг пока нет
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {services.length > 0 ? (
                    services
                      .filter((s) =>
                        globalFilter === ""
                          ? true
                          : s.name.toLowerCase().includes(globalFilter.toLowerCase())
                      )
                      .map((service) => <ServiceCard key={service.id} service={service} />)
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Услуг пока нет
                    </div>
                  )}
                </div>
              </>
            )}

            {!loading && (
              <div className="mt-6 text-sm text-muted-foreground text-center md:text-left">
                Всего услуг: {services.length}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={(v) => {
          if (!v) resetForm();
          setOpen(v);
        }}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                {editingService ? "Редактировать услугу" : "Добавить новую услугу"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 pt-2">
              <div className="grid gap-6">

                {/* Фото услуги - Адаптивный блок */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/20">
                  <div className="relative group flex-shrink-0">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-background shadow-md bg-muted flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                      <Camera className="w-8 h-8 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Изображение услуги</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer bg-background h-10 rounded-xl"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Это фото увидят клиенты при записи. Рекомендуем 400x400px.
                    </p>
                  </div>
                </div>

                {/* Основные поля */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-medium ml-1">Название услуги *</Label>
                    <Input
                      className="h-12 rounded-xl text-base shadow-sm focus-visible:ring-primary/20"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Напр: Стрижка мужская (Fade)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium ml-1">Стоимость (сум) *</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        className="h-12 rounded-xl pl-4 pr-12 text-base shadow-sm"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                UZS
              </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium ml-1">Длительность *</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        className="h-12 rounded-xl pl-4 pr-12 text-base shadow-sm"
                        value={form.duration_min}
                        onChange={(e) => setForm({ ...form, duration_min: e.target.value })}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                мин
              </span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-medium ml-1">Категория *</Label>
                    <Select
                      value={form.categoryId}
                      onValueChange={(v) => setForm({ ...form, categoryId: v })}
                    >
                      <SelectTrigger className="h-12 rounded-xl text-base shadow-sm">
                        <SelectValue placeholder="Выберите категорию услуги" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-lg">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-muted/10 flex-col sm:flex-row gap-2">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1 rounded-xl h-12"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                className="w-full sm:w-auto order-1 sm:order-2 rounded-xl h-12 px-8 font-semibold shadow-md shadow-primary/20"
              >
                {editingService ? "Сохранить изменения" : "Добавить услугу"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedAdminRoute>
  );
}