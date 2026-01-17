'use client';

import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { serviceStore } from "@/stores/service.store";
import { specialistStore } from "@/stores/specialist.store";
import { clientStore } from "@/stores/client.store";
import { bookingService, BookingStatus } from "@/services/booking.service";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {Check, CheckCircle2, ChevronLeft, ChevronRight} from "lucide-react";
import { format } from "date-fns";
import {useRouter} from "next/navigation";
import {PatternFormat} from "react-number-format";
import { Label } from "@radix-ui/react-dropdown-menu";
import {z} from "zod";
import {toast} from "sonner";
import {useTelegram} from "@/context/TelegramContext";

import { useTranslations } from 'next-intl';

type CategoryGroup = {
  id: number;
  name: string;
  services: typeof serviceStore.services;
};


type Step = 1 | 2 | 3 | 4 | 5;

const clientSchema = z.object({
  name: z.string().min(2, "Имя слишком короткое"),
  phone: z.string().length(9, "Введите полный номер телефона"), // Ровно 12 цифр
});

export default observer(function BookingPage() {

  const t = useTranslations();

  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<{ date: string; start: string; end: string } | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [createLoading, setCreateLoading] = useState(false)
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});

  const toggleCategory = (id: number) => {
    setOpenCategories(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };



  const { user, webApp, initData } = useTelegram();

  useEffect(() => {
    if (initData) {
      console.log("Данные получены:", user, webApp, initData);
    } else {
      console.log("Ждем инициализации Telegram...");
    }
  }, [initData, user, webApp]); // Следим за изменениями

  const validate = () => {
    const result = clientSchema.safeParse({ name: clientName, phone: clientPhone });
    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: formattedErrors.name?.[0],
        phone: formattedErrors.phone?.[0],
      });
      return false;
    }
    setErrors({});
    return true;
  };

  const onFinalSubmit = () => {
    if (validate()) {
      handleCreateBooking();
    }
  };

  useEffect(() => {
    serviceStore.fetchAll();
  }, []);

  useEffect(() => {
    if (selectedServices.length > 0) {
      specialistStore.fetchByServices(selectedServices);
    } else {
      specialistStore.specialists = [];
    }
  }, [selectedServices]);



  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [step]);

  useEffect(() => {
    if (selectedSpecialist && selectedServices.length > 0 && selectedDate) {
      setLoadingSlots(true);
      bookingService
        .getFreeSlots(selectedSpecialist, selectedServices, selectedDate)
        .then((slots) => setTimeSlots(slots))
        .catch(() => {
          setTimeSlots([]);
          toast.error("Ошибка загрузки свободного времени");
        })
        .finally(() => setLoadingSlots(false));
    } else {
      setTimeSlots([]);
    }
  }, [selectedSpecialist, selectedServices, selectedDate]);


  const handleCreateBooking = async () => {
    if (!selectedServices || !selectedSpecialist || !selectedTime || !clientName || !clientPhone) {
      toast.error("Заполните все поля"); // Используем toast вместо alert для красоты
      return;
    }

    setCreateLoading(true);
    try {
      const client = await clientStore.create({
        name: clientName,
        phone: `+998${clientPhone}`,
        telegramId: user?.id?.toString(),
        telegramUsername: user?.username,
        telegramFirstName: user?.first_name,
        telegramLastName: user?.last_name,
        telegramLang: user?.language_code,
      });

      const res = await bookingService.create({
        clientId: client.id,
        specialistId: selectedSpecialist,
        serviceIds: selectedServices,
        date: selectedTime.date,
        start_time: selectedTime.start,
        end_time: selectedTime.end,
        status: BookingStatus.PENDING,
      });


      toast.success("Запись успешно создана!");
      router.replace('/booking/' + res.id);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Ошибка при создании записи");
    } finally {
      setCreateLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => (prev < 5 ? ((prev + 1) as Step) : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));

  const groupedServices = serviceStore.services.reduce<Record<number, CategoryGroup>>(
    (acc, service) => {
      const cat = service.category;
      if (cat) {
        if (!acc[cat.id]) {
          acc[cat.id] = {
            id: cat.id,
            name: cat.name,
            services: [],
          };
        }
        acc[cat.id].services.push(service);
      }

      return acc;
    },
    {}
  );

  const categories = Object.values(groupedServices);


  return (
    <div className="min-h-screen bg-background py-8 px-4 text-foreground transition-colors">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center w-full max-w-md">
            {[1, 2, 3, 4, 5].map((s, idx) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-bold transition-all shadow
                ${step >= s ? "bg-primary" : "bg-primary/20"}`}
                >
                  {s}
                </div>

                {idx < 4 && (
                  <div
                    className={`h-1 flex-1 transition-all rounded-full mx-1
                  ${step > s ? "bg-primary" : "bg-primary/20"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="pb-24">
            <Card className="p-6 shadow-xl bg-card border-border animate-in fade-in zoom-in-98 duration-500">
              <h2 className="text-2xl font-semibold mb-6">
                {t("booking.home.step1.title")}
              </h2>

              <div className="space-y-4">
                {categories.map((category) => {
                  const isOpen = openCategories[category.id];

                  return (
                    <div
                      key={category.id}
                      className="border rounded-xl overflow-hidden border-border"
                    >
                      {/* Заголовок категории */}
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-muted hover:bg-muted/70 transition"
                      >
                        <span className="font-semibold text-lg capitalize">
                          {category.name}
                        </span>
                        <ChevronRight
                          className={`transition-transform duration-300 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {/* Контент */}
                      <div
                        className={`grid gap-4 transition-all duration-300 px-4 ${
                          isOpen
                            ? "grid-rows-[1fr] py-4 opacity-100"
                            : "grid-rows-[0fr] py-0 opacity-0 pointer-events-none"
                        }`}
                      >
                        <div className="grid grid-cols-1 gap-4 overflow-hidden">
                          {category.services.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => {
                                setSelectedServices(prev => {
                                  if (prev.includes(s.id)) {
                                    return prev.filter(id => id !== s.id);
                                  } else {
                                    return [...prev, s.id];
                                  }
                                });
                              }}

                                className={`relative border rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                                    ${selectedServices.includes(s.id)
                                  ? "border-primary shadow-md bg-primary/5 ring-1 ring-primary"
                                  : "border-border hover:border-primary/40 bg-card"}`}
                            >
                              {selectedServices.includes(s.id) && (
                                <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-1 animate-in zoom-in duration-200">
                                  <Check className="w-4 h-4" strokeWidth={3} />
                                </div>
                              )}
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${s.photo}`}
                                alt={s.name}
                                className={`w-full h-40 object-cover transition-transform duration-500 ${selectedServices.includes(s.id) ? "scale-105" : ""}`}
                              />
                              <div className="p-4">
                                <h3 className="font-medium text-lg">{s.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {t("common.duration", { minutes: s.duration_min })}
                                </p>
                                <p className="text-primary font-bold text-xl mt-2">
                                  {t("common.price", { amount: s.price })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            </Card>
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-lg p-4 pb-safe shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
              <div className="max-w-2xl mx-auto flex justify-between items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {t("booking.selected")}
                  </span>
                          <span className="text-lg font-bold">
                     {selectedServices.length} {t("booking.services_count")}
                  </span>
                  </div>

                  <Button
                    onClick={nextStep}
                    disabled={selectedServices.length === 0}
                    className="px-10 py-6 text-lg rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {t("common.next")}
                  </Button>
              </div>
            </div>
          </div>
        )}


        {step === 2 && selectedServices.length>0 && (
          <Card className="p-6 shadow-xl bg-card border-border animate-in fade-in zoom-in-98 duration-500 ease-out">
            <h2 className="text-2xl font-semibold mb-6">{t("booking.home.step2.title")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {specialistStore.specialists.map((sp) => (
                <div
                  key={sp.id}
                  onClick={() => {
                    setSelectedSpecialist(sp.id);
                    nextStep();
                  }}
                  className={`border rounded-xl cursor-pointer transition-all duration-300 overflow-hidden active:scale-95
                ${selectedSpecialist === sp.id
                    ? "border-primary shadow-2xl scale-[1.02] ring-4 ring-primary/30"
                    : "border-border hover:border-primary/50 hover:shadow-lg"}`}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${sp.photo}`}
                    alt={sp.name}
                    className="w-full h-48 object-cover bg-muted"
                  />
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg">{sp.name}</h3>
                    {sp.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-3">{sp.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        {t("common.no_description")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={prevStep} className="flex-1 py-6">
                <ChevronLeft className="mr-2 h-4 w-4" /> {t("common.back")}
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && selectedSpecialist && (
          <Card className="p-6 shadow-xl bg-card border-border animate-in fade-in zoom-in-98 duration-500 ease-out">
            <h2 className="text-2xl font-semibold mb-6">{t("booking.home.step3.title")}</h2>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(format(date, "yyyy-MM-dd"));
                    nextStep();
                  }
                }}
                disabled={(d: any) => d < new Date().setHours(0, 0, 0, 0)}
                className="rounded-md border border-border shadow"
              />
            </div>
            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={prevStep} className="flex-1 py-6">
                <ChevronLeft className="mr-2 h-4 w-4" /> {t("common.back")}
              </Button>
            </div>
          </Card>
        )}

        {step === 4 && selectedDate && (
          <Card className="p-6 shadow-xl bg-card border-border animate-in fade-in zoom-in-98 duration-500 ease-out">
            <h2 className="text-2xl font-semibold mb-6">{t("booking.home.step4.title")}</h2>

            {loadingSlots && (
              <p className="text-center py-8 text-muted-foreground">
                {t("booking.loading_slots")}
              </p>
            )}

            {!loadingSlots && timeSlots.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                {t("booking.no_available_time")}
              </p>
            )}

            {!loadingSlots && timeSlots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeSlots.map((slot, i) => (
                  <Button
                    key={i}
                    variant={selectedTime?.start === slot.start ? "default" : "outline"}
                    onClick={() => {
                      setSelectedTime({ ...slot, date: selectedDate });
                      nextStep();
                    }}
                    className="h-14 text-base transition-transform active:scale-95"
                  >
                    {slot.start} – {slot.end}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={prevStep} className="flex-1 py-6">
                <ChevronLeft className="mr-2 h-4 w-4" /> {t("common.back")}
              </Button>
            </div>
          </Card>
        )}

        {step === 5 && selectedTime && (
          <Card className="p-8 shadow-2xl bg-card border-none  animate-in fade-in zoom-in-98 duration-500 ease-out">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">
                {t("booking.home.step5.title")}
              </h2>
              <p className="text-muted-foreground mt-2">
                {t("booking.home.step5.subtitle")}
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="space-y-2">
                <Label className="text-sm font-semibold ml-1">
                  {t("booking.home.step5.nameLabel")}
                </Label>
                <Input
                  id="name"
                  placeholder={t("booking.home.step5.namePlaceholder")}
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`h-14 text-lg rounded-2xl px-5 transition-all ${errors.name ? 'border-destructive ring-destructive/20' : 'focus:ring-primary/20'}`}
                />
                {errors.name && <p className="text-destructive text-xs ml-2 font-medium">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold ml-1">
                  {t("booking.home.step5.phoneLabel")}
                </Label>
                <PatternFormat
                  id="phone"
                  format="+998 (##) ###-##-##"
                  mask="_"
                  customInput={Input}
                  value={clientPhone}
                  onValueChange={(values) => {
                    setClientPhone(values.value);
                    if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }}
                  placeholder="+998 (__) ___-__-__"
                  className={`h-14 text-xl rounded-2xl px-5 tracking-wider font-medium ${
                    errors.phone ? 'border-destructive ring-destructive/20' : ''
                  }`}
                />
                {errors.phone && <p className="text-destructive text-xs ml-2 font-medium">{errors.phone}</p>}
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-3xl p-6 mb-8 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <CheckCircle2 className="w-20 h-20" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("common.service")}</span>
                <span className="font-bold">
                {selectedServices.map(id => serviceStore.services.find(s => s.id === id)?.name).join(', ')}
            </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("common.master")}</span>
                <span className="font-bold">
              {specialistStore.specialists.find((s) => s.id === selectedSpecialist)?.name}
            </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-dashed">
                <span className="text-muted-foreground">{t("common.time")}</span>
                <span className="text-primary font-black">
              {format(new Date(selectedDate!), "dd.MM.yyyy")} | {selectedTime.start}
            </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="ghost"
                onClick={prevStep}
                className="h-14 rounded-2xl flex-1 text-muted-foreground"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> {t("common.back")}
              </Button>
              <Button
                disabled={createLoading}
                onClick={onFinalSubmit}
                className={`h-14 rounded-2xl flex-[2] bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all ${
                  createLoading ? "opacity-50" : ""
                }`}
              >
                {!createLoading ? (
                  <span className="flex items-center">
                {t("booking.confirm_booking")}{" "}
                    <ChevronRight className="ml-2 h-5 w-5" />
              </span>
                ) : (
                  t("common.loading")
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>);
});