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
  Scissors
} from "lucide-react";
import {useRouter} from "next/navigation";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

export default function SpecialistsPage() {
  const router = useRouter()
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Модалка
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
      const data = await specialistService.getAll();
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
    if (!editingSpecialist) fd.append("password", form.password);
    fd.append("role", form.role);
    if (form.description.trim()) fd.append("description", form.description.trim());
    if (form.skills.trim()) fd.append("skills", form.skills.trim());
    if (form.photo) fd.append("photo", form.photo);

    try {
      if (editingSpecialist) {
        // Для update — тоже FormData (на бэкенде FileInterceptor)
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
      setPhotoPreview(spec.photo || null);
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

  const columns: ColumnDef<Specialist>[] = [
    {
      accessorKey: "photo",
      header: "Фото",
      size: 90,
      cell: ({ row }) => (
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-background">
          {row.original.photo ? (
            <img src={`${process.env.NEXT_PUBLIC_API_URL}${row.original.photo}`} alt={row.original.name} className="w-full h-full object-cover" />
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
      size: 100,
      cell: ({row}) => {
        const spec = row.original;

        return (
          <div className="flex items-center gap-1">
            {/* Кнопка редактирования */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEdit(spec)}
            >
              <Edit className="w-4 h-4" />
            </Button>

            {/* Кнопка перехода к услугам */}
            <Button
              size="sm"
              variant="ghost"
              className="text-primary hover:text-primary"
              onClick={() => router.push(`/admin/specialists/${spec.id}/services`)}
              title="Услуги специалиста"
            >
              <Scissors className="w-4 h-4" />
            </Button>

            {/* Кнопка удаления (только для не-админов) */}
            {spec.role !== "ADMIN" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(spec.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: specialists,
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
              <CardTitle className="text-2xl font-bold">Специалисты</CardTitle>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по имени или телефону..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button onClick={() => openEdit()} className="gap-2">
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
                              <span className="ml-1">
                                {header.column.getIsSorted() === "asc" ? "Up" : "Down"}
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
                          Специалистов нет
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Модальное окно */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSpecialist ? "Редактировать специалиста" : "Новый специалист"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Телефон *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998901234567" />
              </div>
            </div>

            {!editingSpecialist && (
              <div className="space-y-2">
                <Label>Пароль *</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPECIALIST">Специалист</SelectItem>
                    <SelectItem value="ADMIN">Администратор</SelectItem>
                  </SelectContent>
                </Select>
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
                    <img src={photoPreview} alt="Preview" className="h-16 w-16 rounded-full object-cover border" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>О себе</Label>
              <Textarea
                placeholder="Краткое описание опыта..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Навыки (через запятую)</Label>
              <Input
                placeholder="Стрижка, окрашивание, укладка..."
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={handleSave}>
              {editingSpecialist ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedAdminRoute>
  );
}