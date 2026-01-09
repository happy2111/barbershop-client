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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { specialistService, Role, Specialist } from "@/services/specialist.service";
import {
  User, Phone, Shield, Edit, Trash2, Plus, Search, Image as ImageIcon,
  Scissors, Camera, EyeOff, Eye
} from "lucide-react";
import { useRouter } from "next/navigation";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

export default function SpecialistsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [open, setOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<Specialist | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    role: "SPECIALIST" as Role,
    description: "",
    skills: "",
    photo: null as File | null,
  });

  useEffect(() => {
    loadSpecialists();
  }, []);

  const loadSpecialists = async () => {
    try {
      const data = await specialistService.getAllPrivate();
      setSpecialists(data);
    } catch {
      toast.error("Не удалось загрузить специалистов");
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
    if (!form.name.trim()) return toast.error("Введите имя");
    if (!form.phone.trim()) return toast.error("Введите телефон");
    if (!editingSpecialist && !form.password.trim()) return toast.error("Введите пароль");

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("phone", form.phone.trim());
    if (!editingSpecialist) fd.append("password", form.password.trim());
    fd.append("role", form.role);
    if (form.description.trim()) fd.append("description", form.description.trim());
    if (form.skills.trim()) fd.append("skills", form.skills.trim());
    if (form.photo) fd.append("photo", form.photo);

    try {
      if (editingSpecialist) {
        await specialistService.update(editingSpecialist.id, fd);
        toast.success("Специалист обновлён");
      } else {
        await specialistService.create(fd);
        toast.success("Специалист создан");
      }

      setOpen(false);
      resetForm();
      loadSpecialists();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(" • ") : msg || "Ошибка сохранения");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить специалиста? Это действие нельзя отменить.")) return;
    try {
      await specialistService.remove(id);
      setSpecialists((prev) => prev.filter((s) => s.id !== id));
      toast.success("Специалист удалён");
    } catch {
      toast.error("Не удалось удалить");
    }
  };

  const openEdit = (spec?: Specialist) => {
    if (spec) {
      setEditingSpecialist(spec);
      setForm({
        name: spec.name,
        phone: spec.phone,
        password: "",
        role: spec.role,
        description: spec.description || "",
        skills: spec.skills || "",
        photo: null,
      });
      setPhotoPreview(spec.photo ? `${process.env.NEXT_PUBLIC_API_URL}${spec.photo}` : null);
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const resetForm = () => {
    setEditingSpecialist(null);
    setForm({
      name: "",
      phone: "",
      password: "",
      role: "SPECIALIST",
      description: "",
      skills: "",
      photo: null,
    });
    setPhotoPreview(null);
  };

  // ─── Desktop Columns ───────────────────────────────────────────────────────
  const desktopColumns: ColumnDef<Specialist>[] = [
    {
      accessorKey: "photo",
      header: "Фото",
      size: 90,
      cell: ({ row }) => (
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-background">
          {row.original.photo ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${row.original.photo}`}
              alt={row.original.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Имя",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
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
      accessorKey: "role",
      header: "Роль",
      cell: ({ row }) => (
        <Badge variant={row.original.role === "ADMIN" ? "destructive" : "secondary"}>
          <Shield className="w-3 h-3 mr-1" />
          {row.original.role === "ADMIN" ? "Админ" : "Специалист"}
        </Badge>
      ),
    },
    {
      accessorKey: "description",
      header: "О себе",
      cell: ({ row }) => (
        <div className="max-w-xs text-sm text-muted-foreground line-clamp-2">
          {row.original.description || "—"}
        </div>
      ),
    },
    {
      id: "actions",
      size: 140,
      cell: ({ row }) => {
        const spec = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => openEdit(spec)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary hover:text-primary/90"
              onClick={() => router.push(`/admin/specialists/${spec.id}/services`)}
              title="Услуги специалиста"
            >
              <Scissors className="h-4 w-4" />
            </Button>
            {spec.role !== "ADMIN" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive/90"
                onClick={() => handleDelete(spec.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: specialists,
    columns: desktopColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: { sorting, globalFilter },
  });

  // ─── Mobile Card ───────────────────────────────────────────────────────────
  const SpecialistCard = ({ specialist }: { specialist: Specialist }) => {
    return (
      <Card className="mb-4 overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          {/* Верхний блок: Фото и Основная информация */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-muted shadow-sm">
                {specialist.photo ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${specialist.photo}`}
                    alt={specialist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              {/* Маленький индикатор роли поверх фото или рядом */}
              <div className="absolute -bottom-1 -right-1">
                <div className={`p-1 rounded-lg border shadow-sm ${
                  specialist.role === "ADMIN" ? "bg-destructive text-white" : "bg-primary text-white"
                }`}>
                  <Shield className="w-3 h-3" />
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex flex-col">
                <h3 className="font-bold text-lg leading-tight truncate">
                  {specialist.name}
                </h3>
                <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                <span className="text-sm font-medium tracking-tight">
                  {specialist.phone}
                </span>
                </div>
                <div className="mt-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  specialist.role === "ADMIN"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {specialist.role === "ADMIN" ? "Администратор" : "Мастер"}
                </span>
                </div>
              </div>
            </div>
          </div>

          {/* Описание */}
          {(specialist.description || specialist.skills) && (
            <div className="mb-5 px-1">
              <p className="text-sm text-muted-foreground line-clamp-2 italic leading-relaxed">
                «{specialist.description || specialist.skills}»
              </p>
            </div>
          )}

          {/* Сетка кнопок действий */}
          <div className="grid grid-cols-2 sm:flex gap-2 pt-4 border-t border-dashed">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 h-9 rounded-xl"
              onClick={() => openEdit(specialist)}
            >
              <Edit className="h-3.5 w-3.5 mr-2" />
              Инфо
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 rounded-xl border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => router.push(`/admin/specialists/${specialist.id}/services`)}
            >
              <Scissors className="h-3.5 w-3.5 mr-2" />
              Услуги
            </Button>

            {specialist.role !== "ADMIN" && (
              <Button
                variant="ghost"
                size="sm"
                className="col-span-2 sm:flex-none h-9 rounded-xl text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={() => handleDelete(specialist.id)}
              >
                <Trash2 className="h-3.5 w-3.5 sm:mr-0" />
                <span className="sm:hidden ml-2">Удалить специалиста</span>
              </Button>
            )}
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
              <CardTitle className="text-2xl font-bold">Специалисты</CardTitle>

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
                  Новый специалист
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block rounded-md border overflow-x-auto">
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
                            Специалистов пока нет
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {specialists.length > 0 ? (
                    specialists
                      .filter(
                        (s) =>
                          globalFilter === "" ||
                          s.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
                          s.phone.includes(globalFilter)
                      )
                      .map((specialist) => (
                        <SpecialistCard key={specialist.id} specialist={specialist} />
                      ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Специалистов пока нет
                    </div>
                  )}
                </div>
              </>
            )}

            {!loading && (
              <div className="mt-6 text-sm text-muted-foreground text-center md:text-left">
                Всего специалистов: {specialists.length}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Модальное окно */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                {editingSpecialist ? "Редактировать профиль" : "Новый специалист"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 pt-2">
              <div className="grid gap-6">

                {/* Фото специалиста - Адаптивная раскладка */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-dashed">
                  <div className="relative group">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-background shadow-md bg-muted flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground/40" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                      <Camera className="w-8 h-8 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Фото профиля</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer bg-background"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      PNG, JPG до 5MB. Рекомендуется квадратное фото.
                    </p>
                  </div>
                </div>

                {/* Основные поля */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Имя мастера *</Label>
                    <Input
                      className="h-11 rounded-xl"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Напр: Алексей Иванов"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Номер телефона *</Label>
                    <Input
                      className="h-11 rounded-xl"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+998 (99) 123-45-67"
                    />
                  </div>

                  {!editingSpecialist && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Пароль для входа *</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"} // Переключаем тип поля
                          className="h-11 rounded-xl pr-10" // Добавили отступ справа для иконки
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Роль в системе</Label>
                    <Select
                      value={form.role}
                      onValueChange={(v) => setForm({ ...form, role: v as Role })}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SPECIALIST">Специалист</SelectItem>
                        <SelectItem value="ADMIN">Администратор (полный доступ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Текстовые блоки */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">О мастере (кратко)</Label>
                    <Textarea
                      className="rounded-xl resize-none"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Расскажите об опыте или стиле работы..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Навыки (через запятую)</Label>
                    <Textarea
                      className="rounded-xl resize-none bg-muted/20"
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      placeholder="Стрижки, Окрашивание, Уход..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-muted/10 flex-col sm:flex-row gap-2">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1 rounded-xl"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                className="w-full sm:w-auto order-1 sm:order-2 rounded-xl px-8"
              >
                {editingSpecialist ? "Сохранить изменения" : "Создать специалиста"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>      </div>
    </ProtectedAdminRoute>
  );
}