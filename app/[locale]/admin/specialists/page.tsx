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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { specialistService, Role, Specialist } from "@/services/specialist.service";
import {
  User, Phone, Shield, Edit, Trash2, Plus, Search, Image as ImageIcon,
  Scissors, Camera, Eye, EyeOff
} from "lucide-react";
import { useRouter } from "next/navigation";
import ProtectedAdminRoute from "@/components/Pretecters&Providers/ProtectedAdminRoute";

export default function SpecialistsPage() {
  const t = useTranslations("admin.specialists");

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
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
    setLoading(true);
    try {
      const data = await specialistService.getAllPrivate();
      setSpecialists(data);
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
    if (!form.phone.trim()) return toast.error(t("errors.phone_required"));
    if (!editingSpecialist && !form.password.trim()) return toast.error(t("errors.password_required"));

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("phone", form.phone.trim());
    if (!editingSpecialist || form.password.trim()) {
      fd.append("password", form.password.trim());
    }
    fd.append("role", form.role);
    if (form.description.trim()) fd.append("description", form.description.trim());
    if (form.skills.trim()) fd.append("skills", form.skills.trim());
    if (form.photo) fd.append("photo", form.photo);

    try {
      if (editingSpecialist) {
        await specialistService.update(editingSpecialist.id, fd);
        toast.success(t("toast.updated"));
      } else {
        await specialistService.create(fd);
        toast.success(t("toast.created"));
      }

      setDialogOpen(false);
      resetForm();
      loadSpecialists();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(" • ") : msg || t("errors.save_failed"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirm.delete"))) return;

    try {
      await specialistService.remove(id);
      setSpecialists((prev) => prev.filter((s) => s.id !== id));
      toast.success(t("toast.deleted"));
    } catch {
      toast.error(t("errors.delete_failed"));
    }
  };

  const openDialog = (spec?: Specialist) => {
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
    setDialogOpen(true);
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
      header: t("table.photo"),
      size: 90,
      cell: ({ row }) => (
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-background shadow-sm">
          {row.original.photo ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${row.original.photo}`}
              alt={row.original.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground/50" />
            </div>
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
      accessorKey: "phone",
      header: t("table.phone"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-mono text-sm">
          <Phone className="w-4 h-4 text-muted-foreground" />
          {row.original.phone}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: t("table.role"),
      cell: ({ row }) => (
        <Badge
          variant={row.original.role === "ADMIN" ? "destructive" : "secondary"}
          className="font-medium flex items-center gap-1 "
        >
          <Shield className="w-3 h-3 " />
          {t(`roles.${row.original.role.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "description",
      header: t("table.description"),
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
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openDialog(spec)}
              title={t("actions.edit")}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="text-primary hover:text-primary/90"
              onClick={() => router.push(`/admin/specialists/${spec.id}/services`)}
              title={t("actions.services")}
            >
              <Scissors className="h-4 w-4" />
            </Button>

            {spec.role !== "ADMIN" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive/90"
                onClick={() => handleDelete(spec.id)}
                title={t("actions.delete")}
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
  const SpecialistCard = ({ specialist }: { specialist: Specialist }) => (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow transition-all">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Фото + роль */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-background shadow-sm">
              {specialist.photo ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${specialist.photo}`}
                  alt={specialist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User className="w-10 h-10 text-muted-foreground/50" />
                </div>
              )}
            </div>

            <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-full border shadow-sm ${
              specialist.role === "ADMIN" ? "bg-destructive" : "bg-primary"
            }`}>
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Информация */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-lg truncate">
                {specialist.name}
              </h3>

              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <Phone className="w-4 h-4" />
                {specialist.phone}
              </div>

              <div className="mt-1">
                <Badge
                  variant={specialist.role === "ADMIN" ? "destructive" : "secondary"}
                  className="text-xs font-medium"
                >
                  {t(`roles.${specialist.role.toLowerCase()}`)}
                </Badge>
              </div>
            </div>

            {(specialist.description || specialist.skills) && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2 italic">
                «{specialist.description || specialist.skills}»
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-5">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 rounded-xl"
                onClick={() => openDialog(specialist)}
              >
                <Edit className="w-4 h-4 mr-2" />
                {t("actions.edit")}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                onClick={() => router.push(`/admin/specialists/${specialist.id}/services`)}
              >
                <Scissors className="w-4 h-4 mr-2" />
                {t("actions.services")}
              </Button>

              {specialist.role !== "ADMIN" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 rounded-xl text-destructive hover:text-destructive/90 border-destructive/30"
                  onClick={() => handleDelete(specialist.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("actions.delete")}
                </Button>
              )}
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
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block rounded-xl border overflow-x-auto">
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
                  {specialists.length > 0 ? (
                    specialists
                      .filter(
                        (s) =>
                          !globalFilter ||
                          s.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
                          s.phone.includes(globalFilter)
                      )
                      .map((specialist) => (
                        <SpecialistCard key={specialist.id} specialist={specialist} />
                      ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      {t("table.no_results")}
                    </div>
                  )}
                </div>
              </>
            )}

            {!loading && specialists.length > 0 && (
              <div className="mt-6 text-sm text-muted-foreground text-center md:text-left">
                {t("table.total", { count: specialists.length })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Модальное окно */}
        <Dialog open={dialogOpen} onOpenChange={(v) => {
          if (!v) resetForm();
          setDialogOpen(v);
        }}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                {editingSpecialist ? t("dialog.edit_title") : t("dialog.new_title")}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 pt-2">
              <div className="grid gap-6">

                {/* Фото */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-muted/30 border border-dashed">
                  <div className="relative group flex-shrink-0">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-4 border-background shadow-md bg-muted flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground/40" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                      <Camera className="w-10 h-10 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium ml-1">
                      {t("form.name.label")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      className="h-12 rounded-xl text-base shadow-sm"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t("form.name.placeholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium ml-1">
                      {t("form.phone.label")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      className="h-12 rounded-xl text-base shadow-sm"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder={t("form.phone.placeholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium ml-1">
                      {editingSpecialist
                        ? t("form.password.change_label")
                        : t("form.password.new_label")}
                      {!editingSpecialist && <span className="text-destructive">*</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="h-12 rounded-xl pr-12 text-base shadow-sm"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder={t("form.password.placeholder")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium ml-1">
                      {t("form.role.label")}
                    </Label>
                    <Select
                      value={form.role}
                      onValueChange={(v) => setForm({ ...form, role: v as Role })}
                    >
                      <SelectTrigger className="h-12 rounded-xl text-base shadow-sm">
                        <SelectValue placeholder={t("form.role.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SPECIALIST">{t("roles.specialist")}</SelectItem>
                        <SelectItem value="ADMIN">{t("roles.admin")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* О себе и навыки */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium ml-1">
                      {t("form.description.label")}
                    </Label>
                    <Textarea
                      className="rounded-xl resize-none min-h-[90px]"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder={t("form.description.placeholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium ml-1">
                      {t("form.skills.label")}
                    </Label>
                    <Textarea
                      className="rounded-xl resize-none min-h-[70px]"
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      placeholder={t("form.skills.placeholder")}
                    />
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
                {editingSpecialist ? t("buttons.save") : t("buttons.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedAdminRoute>
  );
}