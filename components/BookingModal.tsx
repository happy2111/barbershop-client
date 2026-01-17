import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Specialist,
  specialistService,
} from "@/services/specialist.service";
import { Service, serviceService } from "@/services/service.service";
import { Client, clientService } from "@/services/client.service";
import { bookingService, BookingStatus } from "@/services/booking.service";
import {Check, ChevronsUpDown, UserPlus, Phone, User} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {ClientSelector} from "@/components/admin/ClientSelector";
import {ServiceSelector} from "@/components/admin/ServiceSelector";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {SpecialistSelector} from "@/components/admin/SpecialistSelector";

interface AdminBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialistId?: number;
  onCreated?: () => void;
}



const addMinutesToTime = (time: string, minutes: number): string => {
  if (!time) return "";
  const [hours, mins] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);
  return date.toTimeString().slice(0, 5);
};

export const AdminBookingModal: React.FC<AdminBookingModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      specialistId,
                                                                      onCreated,
                                                                    }) => {
  const t = useTranslations("admin.booking_modal");

  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [foundClients, setFoundClients] = useState<Client[]>([]);

  const [clientPhone, setClientPhone] = useState("");
  const [clientName, setClientName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedService, setSelectedService] = useState<Service[]>([]);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [loading, setLoading] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  const [openServ, setOpenServ] = useState(false);
  const [openPhone, setOpenPhone] = useState(false);

  const totalDuration = selectedService.reduce(
    (sum: any, s: any) => sum + s.duration_min,
    0
  );

  const toggleService = (service: Service) => {
    setSelectedService((prev) =>
      prev.some((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    );
  };


  useEffect(() => {
    if (!start || totalDuration === 0) {
      setEnd("");
      return;
    }
    setEnd(addMinutesToTime(start, totalDuration));
  }, [start, totalDuration]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [specs, servs] = await Promise.all([
          specialistService.getAll(),
          serviceService.getAll(),
        ]);
        setSpecialists(specs);
        setServices(servs);
      } catch (err) {
        toast.error(t("errors.load_data"));
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!specialistId || specialists.length === 0) return;

    const found = specialists.find((s) => s.id === specialistId);
    if (found) {
      setSelectedSpecialist(found);
    } else {
      toast.error(t("errors.specialist_not_found"));
      setSelectedSpecialist(null);
    }
  }, [specialistId, specialists]);





  const handlePhoneSearch = async (val: string) => {
    setClientPhone(val);
    if (val.length < 4) {
      setFoundClients([]);
      return;
    }

    try {
      const res = await clientService.searchByPhone(val);
      setFoundClients(res);
    } catch {
      // silent error - пользователь увидит пустой список
    }
  };

  const handleSelectExistingClient = (client: Client) => {
    setClientPhone(client.phone);
    setClientName(client.name || "");
    setSelectedClientId(client.id);
    setIsNewClient(false);
    setOpenPhone(false);
  };

  const handleAddNewClient = () => {
    setIsNewClient(true);
    setClientName("");
    setSelectedClientId(null);
    setOpenPhone(false);
  };

  const handleCreateBooking = async () => {
    if (
      !selectedSpecialist ||
      selectedService.length === 0 ||
      !date ||
      !start ||
      !clientPhone.trim()
    ) {
      toast.error(t("errors.required_fields"));
      return;
    }

    setLoading(true);

    try {
      let client: Client;

      if (selectedClientId) {
        client = await clientService.update(selectedClientId, {
          name: clientName.trim() || undefined,
        });
      } else {
        const found = await clientService.searchByPhone(clientPhone);
        const existing = found.find((c) => c.phone === clientPhone);

        if (existing) {
          client = await clientService.update(existing.id, {
            name: clientName.trim() || undefined,
          });
        } else {
          client = await clientService.create({
            phone: clientPhone,
            name: clientName.trim() || t("new_client_default_name"),
          });
        }
      }

      await bookingService.create({
        clientId: client.id,
        specialistId: selectedSpecialist.id,
        serviceIds: selectedService.map((s) => s.id),
        date,
        start_time: start,
        end_time: end,
        status: BookingStatus.CONFIRMED,
      });

      toast.success(t("success.created"));
      onCreated?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("errors.create_failed"));
    } finally {
      setLoading(false);
    }
  };


  const isSpecialistFixed = !!specialistId;
  const canSubmit =
    !!selectedSpecialist &&
    selectedService.length > 0 &&
    !!date &&
    !!start &&
    !!clientPhone.trim();


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Клиент (поиск по телефону) */}
          <div className="space-y-2 ">
            <label className="text-sm font-medium">{t("fields.client")}</label>
            <ClientSelector
              clientPhone={clientPhone}
              foundClients={foundClients}
              handlePhoneSearch={handlePhoneSearch}
              handleSelectExistingClient={handleSelectExistingClient}
              handleAddNewClient={handleAddNewClient}
              t={t}
            />
          </div>

          {/* Имя клиента (показываем только при создании нового или если уже есть) */}
          {(isNewClient || clientName.trim()) && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("fields.client_name")}</label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={t("placeholders.client_name")}
              />
            </div>
          )}

          {/* Специалист */}
          {isSpecialistFixed ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("fields.specialist")}
              </label>
              <div className="border rounded-md px-3 py-2.5 bg-muted/50 text-base font-medium">
                {selectedSpecialist ? selectedSpecialist.name : t("loading")}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("fields.specialist")}
              </label>

              {isSpecialistFixed ? (
                // Если специалист зафиксирован (например, зашли с его страницы)
                <div className="flex items-center gap-3 border rounded-md px-3 py-2 bg-muted/50 text-base font-medium">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={selectedSpecialist?.photo ?? undefined} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  {selectedSpecialist ? selectedSpecialist.name : t("loading")}
                </div>
              ) : (
                <SpecialistSelector
                  specialists={specialists}
                  selectedSpecialist={selectedSpecialist}
                  setSelectedSpecialist={setSelectedSpecialist}
                  t={t}
                />
              )}
            </div>
          )}

          {/* Услуга */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("fields.service")}</label>
            <ServiceSelector
              services={services}
              selectedServices={selectedService}
              toggleService={toggleService}
              t={t}
            />
          </div>

          {/* Дата и время */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("fields.date")}</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("fields.start_time")}</label>
              <Input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("fields.end_time")}
              </label>
              <Input
                type="time"
                value={end}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 sm:mt-8 gap-3">
          <Button variant="outline" onClick={onClose}>
            {t("buttons.cancel")}
          </Button>
          <Button
            onClick={handleCreateBooking}
            disabled={loading || !canSubmit}
          >
            {loading ? t("buttons.creating") : t("buttons.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};