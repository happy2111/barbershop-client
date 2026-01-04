import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Specialist, specialistService } from "@/services/specialist.service";
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
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [foundClients, setFoundClients] = useState<Client[]>([]);

  // Форма
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

  // Загружаем списки один раз
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
        console.error("Ошибка загрузки данных", err);
        toast.error("Не удалось загрузить специалистов или услуги");
      }
    };
    loadData();
  }, []);

  // Автоматический выбор специалиста, если передан specialistId
  useEffect(() => {
    if (!specialistId || specialists.length === 0) return;

    const found = specialists.find((s) => s.id === specialistId);

    if (found) {
      setSelectedSpecialist(found);
    } else {
      console.warn(`Специалист с ID ${specialistId} не найден среди загруженных`);
      toast.error("Выбранный специалист не найден");
      setSelectedSpecialist(null);
    }
  }, [specialistId, specialists]);

  // Расчёт окончания услуги
  useEffect(() => {
    if (!start || !selectedService?.duration_min) return;
    setEnd(addMinutesToTime(start, selectedService.duration_min));
  }, [start, selectedService?.duration_min]);

  const handlePhoneSearch = async (val: string) => {
    setClientPhone(val);
    if (val.length < 3) {
      setFoundClients([]);
      return;
    }
    try {
      const res = await clientService.searchByPhone(val);
      setFoundClients(res);
    } catch (err) {
      console.error("Ошибка поиска клиента", err);
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
    if (!selectedSpecialist || !selectedService || !date || !start || !clientPhone) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    setLoading(true);

    try {
      let client: Client | null = null;

      // 1. Пытаемся найти / обновить / создать клиента
      if (selectedClientId) {
        client = await clientService.update(selectedClientId, { name: clientName.trim() || undefined });
      } else {
        // Проверяем, существует ли уже такой телефон
        const found = await clientService.searchByPhone(clientPhone);
        const exact = found.find((c) => c.phone === clientPhone);

        if (exact) {
          client = await clientService.update(exact.id, { name: clientName.trim() || undefined });
        }
      }

      // Если клиента всё ещё нет — создаём
      if (!client) {
        client = await clientService.create({
          phone: clientPhone,
          name: clientName.trim() || "Клиент",
        });
      }

      // 2. Создаём бронирование
      await bookingService.create({
        clientId: client.id,
        specialistId: selectedSpecialist.id,
        serviceId: selectedService.id,
        date,
        start_time: start,
        end_time: end,
        status: BookingStatus.CONFIRMED,
      });

      toast.success("Запись успешно создана");
      onCreated?.();
      onClose();
    } catch (err: any) {
      console.error("Ошибка создания записи:", err);
      toast.error(err?.response?.data?.message || "Не удалось создать запись");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setClientPhone("");
    setClientName("");
    setSelectedClientId(null);
    setIsNewClient(false);
    setSelectedService(null);
    setDate("");
    setStart("");
    setEnd("");
    // selectedSpecialist НЕ сбрасываем, если он пришёл через prop
  };

  // Определяем, фиксирован ли специалист
  const isSpecialistFixed = !!specialistId;

  // Если специалист фиксирован, но ещё не выбран → блокируем кнопку
  const canSubmit = !!selectedSpecialist && !!selectedService && !!date && !!start && !!clientPhone.trim();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Новая запись</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-1">
          {/* Телефон клиента */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Клиент</label>
            <Popover open={openPhone} onOpenChange={setOpenPhone}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-2 px-3 text-left font-normal"
                >
                  {clientPhone ? (
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {clientPhone}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Введите номер телефона...</span>
                  )}
                  <ChevronsUpDown className="h-4 w-4 opacity-50 ml-2" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] min-w-80" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Поиск по телефону..."
                    value={clientPhone}
                    onValueChange={handlePhoneSearch}
                  />
                  <CommandList className="max-h-64">
                    <CommandEmpty>Ничего не найдено</CommandEmpty>

                    {foundClients.length > 0 && (
                      <CommandGroup heading="Найденные клиенты">
                        {foundClients.map((client) => (
                          <CommandItem
                            key={client.id}
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
                                <span className="text-xs text-muted-foreground">{client.name}</span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {clientPhone.trim() && (
                      <CommandGroup heading="Добавить нового">
                        <CommandItem
                          onSelect={handleAddNewClient}
                          className="text-primary"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Создать клиента: {clientPhone}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Имя — только если новый клиент или уже выбрали с именем */}
          {(isNewClient || clientName.trim()) && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Имя клиента</label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Имя клиента (необязательно)"
              />
            </div>
          )}

          {/* Специалист — показываем только если НЕ фиксирован */}
          {!isSpecialistFixed && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Специалист</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedSpecialist ? selectedSpecialist.name : "Выберите специалиста"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                  <Command>
                    <CommandInput placeholder="Поиск специалиста..." />
                    <CommandList>
                      <CommandEmpty>Не найдено</CommandEmpty>
                      <CommandGroup>
                        {specialists.map((spec) => (
                          <CommandItem
                            key={spec.id}
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

          {/* Фиксированный специалист — просто отображаем */}
          {isSpecialistFixed && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Специалист</label>
              <div className="border rounded-md px-3 py-2 bg-muted/40 text-base font-medium">
                {selectedSpecialist ? selectedSpecialist.name : "Загрузка..."}
              </div>
            </div>
          )}

          {/* Услуга */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Услуга</label>
            <Popover open={openServ} onOpenChange={setOpenServ}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedService
                    ? `${selectedService.name} (${selectedService.duration_min} мин)`
                    : "Выберите услугу"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                  <CommandInput placeholder="Поиск услуги..." />
                  <CommandList>
                    <CommandEmpty>Не найдено</CommandEmpty>
                    <CommandGroup>
                      {services.map((s) => (
                        <CommandItem
                          key={s.id}
                          onSelect={() => {
                            setSelectedService(s);
                            setOpenServ(false);
                          }}
                          className="flex justify-between"
                        >
                          <span>{s.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {s.duration_min} мин
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Дата + время */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Дата</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Начало</label>
              <Input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Конец</label>
              <Input type="time" value={end} readOnly className="bg-muted" />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 gap-3 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            onClick={handleCreateBooking}
            disabled={loading || !canSubmit}
          >
            {loading ? "Создание..." : "Создать запись"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};