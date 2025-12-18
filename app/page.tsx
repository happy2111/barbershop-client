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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import {useRouter} from "next/navigation";

type Step = 1 | 2 | 3 | 4 | 5;

export default observer(function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<{ date: string; start: string; end: string } | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    serviceStore.fetchAll();
  }, []);

  useEffect(() => {
    if (selectedService) {
      specialistStore.fetchByService(selectedService);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedSpecialist && selectedService && selectedDate) {
      setLoadingSlots(true);
      bookingService
        .getFreeSlots(selectedSpecialist, selectedService, selectedDate)
        .then((slots) => setTimeSlots(slots))
        .catch(() => {
          setTimeSlots([]);
          alert("Ошибка загрузки свободного времени");
        })
        .finally(() => setLoadingSlots(false));
    } else {
      setTimeSlots([]);
    }
  }, [selectedSpecialist, selectedService, selectedDate]);

  const handleCreateBooking = async () => {
    if (!selectedService || !selectedSpecialist || !selectedTime || !clientName || !clientPhone) {
      alert("Заполните все поля");
      return;
    }

    try {
      const client: any = await clientStore.create({ name: clientName, phone: clientPhone });
      const res = await bookingService.create({
        clientId: client.id,
        specialistId: selectedSpecialist,
        serviceId: selectedService,
        date: selectedTime.date,
        start_time: selectedTime.start,
        end_time: selectedTime.end,
        status: BookingStatus.PENDING,
      });

      router.replace('booking/'+res.id);
      alert("Запись успешно создана!");
    } catch (err) {
      alert("Ошибка при создании записи");
    }
  };

  const nextStep = () => setStep((prev) => (prev < 5 ? ((prev + 1) as Step) : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));

  return (
    <div className="min-h-screen bg-background py-8 px-4 text-foreground transition-colors">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center w-full max-w-md">
            {[1, 2, 3, 4, 5].map((s, idx) => (
              <div key={s} className="flex items-center flex-1">
                {/* Круг */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-bold transition-all shadow
            ${step >= s ? "bg-primary" : "bg-primary/20"}`}
                >
                  {s}
                </div>

                {/* Полоска */}
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
          <Card className="p-6 shadow-xl bg-card border-border">
            <h2 className="text-2xl font-semibold mb-6">Выберите услугу</h2>
            <div className="grid grid-cols-1 gap-4">
              {serviceStore.services.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedService(s.id);
                    nextStep();
                  }}
                  className={`border rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                    ${selectedService === s.id
                    ? "border-primary shadow-xl ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50"}`}
                >
                  <img src={`${process.env.NEXT_PUBLIC_API_URL}${s.photo}`} alt={s.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-medium text-lg">{s.name}</h3>
                    <p className="text-sm text-muted-foreground">{s.duration_min} мин</p>
                    <p className="text-primary font-bold text-xl mt-2">{s.price} сум</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {step === 2 && selectedService && (
          <Card className="p-6 shadow-xl bg-card border-border">
            <h2 className="text-2xl font-semibold mb-6">Выберите специалиста</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {specialistStore.specialists.map((sp) => (
                <div
                  key={sp.id}
                  onClick={() => {
                    setSelectedSpecialist(sp.id);
                    nextStep();
                  }}
                  className={`border rounded-xl cursor-pointer transition-all duration-300 overflow-hidden
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
                      <p className="text-sm text-muted-foreground italic">Описание отсутствует</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={prevStep} className="flex-1 py-6">
                <ChevronLeft className="mr-2 h-4 w-4" /> Назад
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && selectedSpecialist && (
          <Card className="p-6 shadow-xl bg-card border-border">
            <h2 className="text-2xl font-semibold mb-6">Выберите дату</h2>
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
                <ChevronLeft className="mr-2 h-4 w-4" /> Назад
              </Button>
            </div>
          </Card>
        )}

        {step === 4 && selectedDate && (
          <Card className="p-6 shadow-xl bg-card border-border">
            <h2 className="text-2xl font-semibold mb-6">Время</h2>

            {loadingSlots && <p className="text-center py-8 text-muted-foreground">Загрузка...</p>}

            {!loadingSlots && timeSlots.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">Нет свободного времени</p>
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
                    className="h-14 text-base"
                  >
                    {slot.start} – {slot.end}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={prevStep} className="flex-1 py-6">
                <ChevronLeft className="mr-2 h-4 w-4" /> Назад
              </Button>
            </div>
          </Card>
        )}

        {step === 5 && selectedTime && (
          <Card className="p-6 shadow-xl bg-card border-border">
            <h2 className="text-2xl font-semibold mb-6">Ваши данные</h2>

            <div className="space-y-4 mb-8">
              <Input
                placeholder="Ваше имя"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="h-12 text-lg"
              />
              <Input
                placeholder="Телефон"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <p><strong>Услуга:</strong> {serviceStore.services.find((s) => s.id === selectedService)?.name}</p>
              <p><strong>Специалист:</strong> {specialistStore.specialists.find((s) => s.id === selectedSpecialist)?.name}</p>
              <p><strong>Дата и время:</strong> {format(new Date(selectedDate!), "dd.MM.yyyy")} {selectedTime.start} – {selectedTime.end}</p>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={prevStep} className="flex-1 py-6">
                <ChevronLeft className="mr-2 h-4 w-4 " /> Назад
              </Button>
              <Button
                onClick={handleCreateBooking}
                disabled={!clientName.trim() || !clientPhone.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
              >
                <ChevronRight className="ml-2 h-5 w-5" /> Записаться
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
});