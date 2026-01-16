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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { serviceService, Service } from "@/services/service.service";
import { serviceCategoryService } from "@/services/service-category.service";
import {
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Image as ImageIcon,
  Search,
  Camera,
} from "lucide-react";
import ProtectedAdminRoute from "@/components/Pretecters&Providers/ProtectedAdminRoute";

interface ServiceCategory {
  id: number;
  name: string;
}

export default function ServicesPage() {
  const t = useTranslations("admin.services");

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
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
    setLoading(true);
    try {
      const [servicesData, categoriesData] = await Promise.all([
        serviceService.getAll(),
        serviceCategoryService.getAll(),
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch {
      toast.error(t("errors.load_failed"));
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
    if (!form.name.trim()) return toast.error(t("errors.name_required"));
    if (!form.price || Number(form.price) <= 0) return toast.error(t("errors.price_invalid"));
    if (!form.duration_min || Number(form.duration_min) < 1) return toast.error(t("errors.duration_invalid"));
    if (!form.categoryId) return toast.error(t("errors.category_required"));

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
        toast.success(t("toast.updated"));
      } else {
        const fd = new FormData();
        fd.append("name", payload.name);
        fd.append("price", payload.price.toString());
        fd.append("duration_min", payload.duration_min.toString());
        fd.append("categoryId", payload.categoryId.toString());
        if (form.photo) fd.append("photo", form.photo);

        await serviceService.create(fd);
        toast.success(t("toast.created"));
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(" • ") : msg || t("errors.save_failed"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirm.delete"))) return;

    try {
      await serviceService.remove(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success(t("toast.deleted"));
    } catch {
      toast.error(t("errors.delete_failed"));
    }
  };

  const openDialog = (service?: Service) => {
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
    setDialogOpen(true);
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
      header: t("table.photo"),
      size: 100,
      cell: ({ row }) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center">
          {row.original.photo ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${row.original.photo}`}
              alt={row.original.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: t("table.name"),
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "category.name",
      header: t("table.category"),
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-medium">
          {row.original.category?.name || t("table.no_category")}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: t("table.price"),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.price.toLocaleString()} {t("common.sum")}
        </div>
      ),
    },
    {
      accessorKey: "duration_min",
      header: t("table.duration"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          {row.original.duration_min} {t("common.minutes")}
        </div>
      ),
    },
    {
      id: "actions",
      size: 120,
      cell: ({ row }) => (
        <div className="flex gap-1">
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
    <Card className="overflow-hidden border-none shadow-sm hover:shadow transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Фото */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border bg-muted/30 flex-shrink-0">
            {service.photo ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${service.photo}`}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Информация */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">
              {service.name}
            </h3>

            <div className="text-sm text-muted-foreground mb-3">
              {service.category?.name || t("table.no_category")}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>{service.price.toLocaleString()} {t("common.sum")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{service.duration_min} {t("common.minutes")}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => openDialog(service)}
              >
                <Edit className="w-4 h-4 mr-2" />
                {t("actions.edit")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive/90 border-destructive/30"
                onClick={() => handleDelete(service.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("actions.delete")}
              </Button>
            </div>
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
                  <Skeleton key={i} className="h-40 md:h-32 w-full rounded-xl" />
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
                  {services.length > 0 ? (
                    services
                      .filter((s) =>
                        !globalFilter || s.name.toLowerCase().includes(globalFilter.toLowerCase())
                      )
                      .map((service) => <ServiceCard key={service.id} service={service} />)
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      {t("table.no_results")}
                    </div>
                  )}
                </div>
              </>
            )}

            {!loading && services.length > 0 && (
              <div className="mt-6 text-sm text-muted-foreground text-center md:text-left">
                {t("table.total", { count: services.length })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Модальное окно создания/редактирования */}
        <Dialog open={dialogOpen} onOpenChange={(v) => {
          if (!v) resetForm();
          setDialogOpen(v);
        }}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                {editingService ? t("dialog.edit_title") : t("dialog.new_title")}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 pt-2">
              <div className="grid gap-6">

                {/* Фото услуги */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/20">
                  <div className="relative group flex-shrink-0">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-4 border-background shadow-md bg-muted flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                      <Camera className="w-10 h-10 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <Label className="text-base font-semibold">
                      {t("form.photo.label")}
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer bg-background h-11 rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("form.photo.hint")}
                    </p>
                  </div>
                </div>

                {/* Основные поля */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-medium ml-1">
                      {t("form.name.label")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      className="h-12 rounded-xl text-base shadow-sm focus-visible:ring-primary/20"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t("form.name.placeholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium ml-1">
                      {t("form.price.label")} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        className="h-12 rounded-xl pl-4 pr-16 text-base shadow-sm"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                        {t("common.sum")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium ml-1">
                      {t("form.duration.label")} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        className="h-12 rounded-xl pl-4 pr-16 text-base shadow-sm"
                        value={form.duration_min}
                        onChange={(e) => setForm({ ...form, duration_min: e.target.value })}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                        {t("common.minutes")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-medium ml-1">
                      {t("form.category.label")} <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.categoryId}
                      onValueChange={(v) => setForm({ ...form, categoryId: v })}
                    >
                      <SelectTrigger className="h-12 rounded-xl text-base shadow-sm">
                        <SelectValue placeholder={t("form.category.placeholder")} />
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

            <DialogFooter className="p-6 border-t bg-muted/10 flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1 rounded-xl h-12"
              >
                {t("buttons.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                className="w-full sm:w-auto order-1 sm:order-2 rounded-xl h-12 px-8 font-semibold shadow-md shadow-primary/20"
              >
                {editingService ? t("buttons.save") : t("buttons.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedAdminRoute>
  );
}