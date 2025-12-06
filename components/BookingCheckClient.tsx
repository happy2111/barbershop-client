"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, ImageDown } from "lucide-react";
import html2canvas from "html2canvas";
import {useEffect, useState} from "react";
import {bookingService} from "@/services/booking.service";
import domtoimage from 'dom-to-image-more';

export default function BookingCheckClient({ id }: { id: number }) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bookingService
      .getById(id)
      .then((data) => {
        setBooking(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки брони:", err);
        setError("Не удалось загрузить бронь");
        setLoading(false);
      });
  }, [id]); // ← не забываем зависимость!

  console.log("data", booking);


  const handleScreenshot = async () => {
    const element = document.getElementById("booking-check");
    if (!element || !booking) return;

    try {
      const dataUrl = await domtoimage.toPng(element, {
        quality: 1,
        // Опционально: улучшить качество шрифтов и тень
        style: {
          // если у тебя где-то transform: scale() — это спасёт
          transform: 'scale(2)',
          transformOrigin: 'top left',
        },
        width: element.scrollWidth * 2,
        height: element.scrollHeight * 2,
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `booking-${booking.id}.png`;
      a.click();
    } catch (err) {
      console.error("Ошибка создания скриншота:", err);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({
        title: "Моя бронь",
        text: "Бронь в барбершопе",
        url: window.location.href,
      });
    }
  };


  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!booking) return <div>Бронь не найдена</div>;
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 !border-none">
      <Card id="booking-check" className="max-w-lg w-full h-full p-4 shadow-xl rounded-2xl">
        <CardHeader className="!border-none">
          <CardTitle className="text-center text-2xl !border-none">Подтверждение брони</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 !border-none">
          <div className="grid grid-cols-2 gap-2 text-sm !border-none">
            <span className="text-muted-foreground !border-none">ID:</span>
            <span className="font-medium !border-none">{booking.id}</span>

            <span className="text-muted-foreground !border-none">Услуга:</span>
            <span className="font-medium !border-none">{booking.service?.name}</span>

            <span className="text-muted-foreground !border-none">Цена:</span>
            <span className="font-medium !border-none">{booking.service?.price} so'm</span>

            <span className="text-muted-foreground !border-none">Мастер:</span>
            <span className="font-medium !border-none">{booking.specialist?.name}</span>

            <span className="text-muted-foreground !border-none">Дата:</span>
            <span className="font-medium !border-none">{booking.date}</span>

            <span className="text-muted-foreground !border-none">Время:</span>
            <span className="font-medium !border-none">
              {booking.start_time} — {booking.end_time}
            </span>

            <span className="text-muted-foreground !border-none">Статус:</span>
            <span className="font-medium !border-none">{booking.status}</span>
          </div>

          <div className="flex gap-3 flex-wrap justify-center pt-4 !border-none ">
            <Button onClick={handleScreenshot} className="flex gap-2 !border-none">
              <ImageDown className="!border-none" size={18} /> PNG
            </Button>

            <Button variant="secondary" onClick={handleCopyLink} className="flex gap-2 !border-none">
              <Copy className="!border-none" size={18} /> Копировать
            </Button>

            <Button variant="outline" onClick={handleShare} className="flex gap-2 !border-none">
              <Share2 className="!border-none" size={18} /> Поделиться
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
