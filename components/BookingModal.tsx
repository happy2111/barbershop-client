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
import { Check, ChevronsUpDown, UserPlus, Phone } from "lucide-react";
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
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [loading, setLoading] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  const [openServ, setOpenServ] = useState(false);
  const [openPhone, setOpenPhone] = useState(false);

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

  useEffect(() => {
    if (!start || !selectedService?.duration_min) return;
    setEnd(addMinutesToTime(start, selectedService.duration_min));
  }, [start, selectedService?.duration_min]);

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
    if (!selectedSpecialist || !selectedService || !date || !start || !clientPhone.trim()) {
      toast.error(t("errors.required_fields"));
      return;
    }

    setLoading(true);

    try {
      let client: Client;

      // 1. Клиент уже выбран по ID
      if (selectedClientId) {
        client = await clientService.update(selectedClientId, {
          name: clientName.trim() || undefined,
        });
      }
      // 2. Проверяем, вдруг клиент с таким телефоном уже существует
      else {
        const found = await clientService.searchByPhone(clientPhone);
        const existing = found.find((c) => c.phone === clientPhone);

        if (existing) {
          client = await clientService.update(existing.id, {
            name: clientName.trim() || undefined,
          });
        }
        // 3. Создаём нового
        else {
          client = await clientService.create({
            phone: clientPhone,
            name: clientName.trim() || t("new_client_default_name"),
          });
        }
      }

      // 4. Создаём бронь
      await bookingService.create({
        clientId: client.id,
        specialistId: selectedSpecialist.id,
        serviceId: selectedService.id,
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
  const canSubmit = !!selectedSpecialist && !!selectedService && !!date && !!start && !!clientPhone.trim();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Клиент (поиск по телефону) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("fields.client")}</label>
            <Popover open={openPhone} onOpenChange={setOpenPhone}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPhone}
                  className="w-full justify-between h-auto py-2.5 px-3 text-left font-normal"
                >
                  {clientPhone ? (
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      {clientPhone}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {t("placeholders.client_phone")}
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0 w-full" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={t("placeholders.search_phone")}
                    value={clientPhone}
                    onValueChange={handlePhoneSearch}
                  />
                  <CommandList className="max-h-60">
                    <CommandEmpty>{t("search.no_results")}</CommandEmpty>

                    {foundClients.length > 0 && (
                      <CommandGroup heading={t("search.found_clients")}>
                        {foundClients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.phone}
                            onSelect={() => handleSelectExistingClient(client)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                clientPhone === client.phone ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{client.phone}</span>
                              {client.name && (
                                <span className="text-xs text-muted-foreground">
                                  {client.name}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {clientPhone.trim().length >= 7 && (
                      <CommandGroup heading={t("search.add_new")}>
                        <CommandItem
                          onSelect={handleAddNewClient}
                          className="text-primary"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          {t("search.create_new", { phone: clientPhone })}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
              <label className="text-sm font-medium">{t("fields.specialist")}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedSpecialist
                      ? selectedSpecialist.name
                      : t("placeholders.select_specialist")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder={t("placeholders.search_specialist")} />
                    <CommandList>
                      <CommandEmpty>{t("search.no_results")}</CommandEmpty>
                      <CommandGroup>
                        {specialists.map((spec) => (
                          <CommandItem
                            key={spec.id}
                            value={spec.name}
                            onSelect={() => setSelectedSpecialist(spec)}
                          >
                            {spec.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Услуга */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("fields.service")}</label>
            <Popover open={openServ} onOpenChange={setOpenServ}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedService
                    ? `${selectedService.name} (${selectedService.duration_min} ${t("common.minutes")})`
                    : t("placeholders.select_service")}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder={t("placeholders.search_service")} />
                  <CommandList>
                    <CommandEmpty>{t("search.no_results")}</CommandEmpty>
                    <CommandGroup>
                      {services.map((s) => (
                        <CommandItem
                          key={s.id}
                          value={s.name}
                          onSelect={() => {
                            setSelectedService(s);
                            setOpenServ(false);
                          }}
                        >
                          <div className="flex justify-between w-full">
                            <span>{s.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {s.duration_min} {t("common.minutes")}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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