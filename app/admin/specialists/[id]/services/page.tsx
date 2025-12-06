// app/admin/specialists/[id]/services/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

import { specialistService, Specialist } from "@/services/specialist.service";
import { serviceService, Service } from "@/services/service.service";
import { specialistServiceService } from "@/services/specialist-service.service";

import { ArrowLeft, Scissors, Clock, DollarSign, Search, Plus, Trash2 } from "lucide-react";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

export default function SpecialistServicesPage() {
  const params = useParams();
  const router = useRouter();
  const specialistId = Number(params.id);

  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [assignedServices, setAssignedServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  useEffect(() => {
    if (!specialistId) return;
    loadData();
  }, [specialistId]);

  const loadData = async () => {
    try {
      const [spec, allServicesData] = await Promise.all([
        specialistService.getById(specialistId),
        serviceService.getAll(),
      ]);

      // Получаем привязанные услуги через specialist-service
      const relations = await specialistServiceService.getAll();
      const assignedIds = relations
        .filter(r => r.specialistId === specialistId)
        .map(r => r.serviceId);

      const assigned = allServicesData.filter(s => assignedIds.includes(s.id));

      setSpecialist(spec);
      setAllServices(allServicesData);
      setAssignedServices(assigned);
    } catch (err) {
      toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  const availableServices = allServices.filter(
    s => !assignedServices.some(as => as.id === s.id)
  );

  const handleAddService = async () => {
    if (!selectedServiceId) return toast.error("Выберите услугу");

    try {
      await specialistServiceService.create({
        specialistId,
        serviceId: Number(selectedServiceId),
      });
      toast.success("Услуга добавлена");
      setOpen(false);
      setSelectedServiceId("");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Ошибка добавления");
    }
  };

  const handleRemoveService = async (serviceId: number) => {
    if (!confirm("Отвязать услугу от специалиста?")) return;

    try {
      const relations = await specialistServiceService.getAll();
      const relation = relations.find(
        r => r.specialistId === specialistId && r.serviceId === serviceId
      );
      if (relation) {
        await specialistServiceService.remove(relation.id);
        toast.success("Услуга отвязана");
        loadData();
      }
    } catch {
      toast.error("Не удалось отвязать услугу");
    }
  };

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "photo",
      header: "Фото",
      size: 80,
      cell: ({ row }) => (
        <div className="w-12 h-12 rounded-md overflow-hidden border">
          {row.original.photo ? (
            <img src={row.original.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Scissors className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Услуга",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "category",
      header: "Категория",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.category?.name || "—"}</Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "Цена",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          {row.original.price.toLocaleString()}
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
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => handleRemoveService(row.original.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: assignedServices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!specialist) {
    return <div>Специалист не найден</div>;
  }

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold">
            Услуги специалиста: <span className="text-primary">{specialist.name}</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Управление услугами, которые может оказывать этот специалист
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Привязанные услуги</CardTitle>
              <Button onClick={() => setOpen(true)} disabled={availableServices.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить услугу
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {assignedServices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Scissors className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>У этого специалиста пока нет услуг</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              Всего услуг: {assignedServices.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Диалог добавления услуги */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить услугу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Выберите услугу</Label>
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите из доступных..." />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      <div className="flex items-center gap-3">
                        <Scissors className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {service.category?.name} • {service.duration_min} мин • {service.price.toLocaleString()} сум
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableServices.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Все услуги уже привязаны к этому специалисту
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={handleAddService} disabled={!selectedServiceId}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedAdminRoute>
  );
}