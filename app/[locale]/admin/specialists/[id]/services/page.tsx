"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { specialistService, Specialist } from "@/services/specialist.service";
import { serviceService, Service } from "@/services/service.service";
import { specialistServiceService } from "@/services/specialist-service.service";

import { ArrowLeft, Scissors, Clock, Plus, Trash2 } from "lucide-react";
import ProtectedAdminRoute from "@/components/Pretecters&Providers/ProtectedAdminRoute";

export default function SpecialistServicesPage() {
  const params = useParams();
  const router = useRouter();
  const specialistId = Number(params.id);

  // Инициализация переводов
  const t = useTranslations("admin.specialist_services");
  const common = useTranslations("common");

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

      const relations = await specialistServiceService.getAll();
      const assignedIds = relations
        .filter((r) => r.specialistId === specialistId)
        .map((r) => r.serviceId);

      const assigned = allServicesData.filter((s) => assignedIds.includes(s.id));

      setSpecialist(spec);
      setAllServices(allServicesData);
      setAssignedServices(assigned);
    } catch {
      toast.error(t("errors.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const availableServices = allServices.filter(
    (s) => !assignedServices.some((as) => as.id === s.id)
  );

  const handleAddService = async () => {
    if (!selectedServiceId) return toast.error(t("errors.select_service"));

    try {
      await specialistServiceService.create({
        specialistId,
        serviceId: Number(selectedServiceId),
      });
      toast.success(t("toast.added"));
      setOpen(false);
      setSelectedServiceId("");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("errors.add_failed"));
    }
  };

  const handleRemoveService = async (serviceId: number) => {
    if (!confirm(t("confirm.remove"))) return;

    try {
      const relations = await specialistServiceService.getAll();
      const relation = relations.find(
        (r) => r.specialistId === specialistId && r.serviceId === serviceId
      );
      if (relation) {
        await specialistServiceService.remove(relation.id);
        toast.success(t("toast.removed"));
        loadData();
      }
    } catch {
      toast.error(t("errors.remove_failed"));
    }
  };

  const desktopColumns: ColumnDef<Service>[] = [
    {
      accessorKey: "photo",
      header: t("table.photo"),
      size: 80,
      cell: ({ row }) => (
        <div className="w-12 h-12 rounded-md overflow-hidden border">
          {row.original.photo ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${row.original.photo}`}
              alt={row.original.name}
              className="w-full h-full object-cover"
            />
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
      header: t("table.name"),
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "category",
      header: t("table.category"),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.category?.name || t("table.no_category")}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: t("table.price"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-nowrap">
          {row.original.price.toLocaleString()} {common("sum")}
        </div>
      ),
    },
    {
      accessorKey: "duration_min",
      header: t("table.duration"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-nowrap">
          <Clock className="w-4 h-4 text-muted-foreground" />
          {row.original.duration_min} {common("minutes")}
        </div>
      ),
    },
    {
      id: "actions",
      size: 80,
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive/90"
          onClick={() => handleRemoveService(row.original.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: assignedServices,
    columns: desktopColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const ServiceCard = ({ service }: { service: Service }) => (
    <Card className="mb-4 overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <div className="w-full h-full rounded-xl overflow-hidden border bg-muted">
              {service.photo ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${service.photo}`}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-muted-foreground/50" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base leading-tight line-clamp-2">
              {service.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {service.category?.name || t("table.no_category")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-dashed">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {t("table.price")}
              </span>
              <span className="font-bold text-primary">
                {service.price.toLocaleString()} {common("sum")}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {t("table.duration")}
              </span>
              <div className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{service.duration_min} {common("minutes")}</span>
              </div>
            </div>
          </div>

          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => handleRemoveService(service.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="container mx-auto py-12 px-4 text-center text-muted-foreground">
        {t("errors.not_found")}
      </div>
    );
  }

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("buttons.back")}
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">
            {t("title", { name: specialist.name })}
          </h1>
          <p className="text-muted-foreground mt-1.5">
            {t("subtitle")}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{t("assigned_title")}</CardTitle>
              <Button
                onClick={() => setOpen(true)}
                disabled={availableServices.length === 0}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("buttons.add_service")}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {assignedServices.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Scissors className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p className="text-lg">{t("empty.title")}</p>
                <p className="mt-2">{t("empty.hint")}</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block rounded-md border">
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
                        <TableRow key={row.id} className="hover:bg-muted/50">
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

                <div className="md:hidden space-y-4">
                  {assignedServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </>
            )}

            {assignedServices.length > 0 && (
              <div className="mt-6 text-sm text-muted-foreground text-center md:text-left">
                {t("total", { count: assignedServices.length })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dialog.title")}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Label className="mb-2 block">{t("dialog.label")}</Label>
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger>
                <SelectValue placeholder={t("dialog.placeholder")} />
              </SelectTrigger>
              <SelectContent className="max-h-[320px]">
                {availableServices.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    <div className="flex flex-col py-1">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {service.category?.name || t("table.no_category")} • {service.duration_min} {common("minutes")} •{" "}
                        {service.price.toLocaleString()} {common("sum")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                {availableServices.length === 0 && (
                  <div className="py-2 px-3 text-sm text-muted-foreground">
                    {t("dialog.no_available")}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("buttons.cancel")}
            </Button>
            <Button onClick={handleAddService} disabled={!selectedServiceId}>
              {t("buttons.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedAdminRoute>
  );
}