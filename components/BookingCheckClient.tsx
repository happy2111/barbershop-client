"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Copy,
  House,
  ImageDown,
  Share2,
  X,
  XCircle
} from "lucide-react";
import React, {useEffect, useState} from "react";
import {bookingService, BookingStatus} from "@/services/booking.service";
import domtoimage from 'dom-to-image-more';

import {format, parseISO} from "date-fns";
import {uz} from "date-fns/locale";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {toast} from "sonner";

interface StatusMeta {
  label: string;
  note: string;
  color: string;
}
export default function BookingCheckClient({ id }: { id: number }) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNote, setHasNote] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);


  const statusMap = new Map<string, StatusMeta>([
    [
      "PENDING",
      {
        label: "В ожидании",
        note: "Ваша бронь находится в ожидании подтверждения. Пожалуйста, дождитесь изменения статуса или свяжитесь с барбером.",
        color: "bg-yellow-900/10",
      },
    ],
    [
      "CONFIRMED",
      {
        label: "Подтверждена",
        note: "Ваша бронь подтверждена. Пожалуйста, приходите в назначенное время.",
        color: "bg-blue-900/10",
      },
    ],
    [
      "COMPLETED",
      {
        label: "Завершена",
        note: "Услуга успешно оказана. Спасибо, что выбрали наш барбершоп!",
        color: "bg-green-900/10",
      },
    ],
    [
      "CANCELLED",
      {
        label: "Отменена",
        note: "Бронь была отменена. Вы можете создать новую запись в любое время.",
        color: "bg-red-900/10",
      },
    ],
  ]);



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
  }, [id]);

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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handleCancelBooking = async () => {
    try {
      await bookingService.updateStatus(id, BookingStatus.CANCELLED)
      setShowDialog(false)
      router.push("/")
      toast.success("")
    } catch (e) {
      console.log(e)
    }
  }


  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!booking) return <div>Бронь не найдена</div>;
  if (booking.status === BookingStatus.CANCELLED) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        {/* Иконка с мягким красным фоном */}
        <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-50">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>

        {/* Текстовый блок */}
        <h1 className="mb-2 text-2xl font-bold tracking-tight ">
          Бронирование отменено
        </h1>
        <p className="max-w-xs mb-8 text-muted-foreground">
          Данная запись была аннулирована. Если это ошибка, пожалуйста, свяжитесь с поддержкой.
        </p>

        {/* Действие */}
        <Button asChild variant="outline" className="gap-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Вернуться на главную
          </Link>
        </Button>
      </div>
    );
  }

  const status = statusMap.get(booking.status);

  return (
    <div className="w-full min-h-screen relative flex flex-col gap-6 items-center justify-center p-4 !border-none">
     <div className={"max-w-lg w-full flex items-center justify-between mb-4 !border-none"}>
       <Link href="/" className="text-2xl font-bold">
         Ramitan Barbershop
       </Link>
       <Button onClick={() => router.push("/")}> <House /> Главная страница</Button>
     </div>

      <Card id="booking-check" className="max-w-lg w-full h-full p-4 shadow-xl rounded-2xl relative">
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
            {booking.date ? format(parseISO(booking.date), "dd MMMM yyyy", { locale: uz }) : "-"}


            <span className="text-muted-foreground !border-none">Время:</span>
            <span className="font-medium !border-none">
              {booking.start_time} — {booking.end_time}
            </span>

            <span className="text-muted-foreground !border-none">Статус:</span>
            <span className="font-medium !border-none">{status?.label}</span>

            {hasNote && (
              <span className={`${status?.color} relative col-span-2 p-3 rounded-md flex flex-col gap-1 !border-none`}>
                <span className="absolute left-[calc(100%-40px)] flex gap-2 !border-none transform transition-transform duration-150 active:scale-95 active:opacity-80" onClick={()=> setHasNote(false)}><X/></span>
                <span className="text-muted-foreground !border-none">Примечание:</span>
                <span className="font-medium !border-none">
                  {status?.note}
                </span>
              </span>
            )}
          </div>

          <div className="flex gap-3 flex-wrap justify-center pt-4 !border-none">
            <Button
              onClick={handleScreenshot}
              className="flex gap-2 !border-none transform transition-transform duration-150 active:scale-95 active:opacity-80"
            >
              <ImageDown className="!border-none" size={18} /> PNG
            </Button>

            <Button
              variant="secondary"
              onClick={handleCopyLink}
              className="flex gap-2 !border-none transform transition-transform duration-150 active:scale-95 active:opacity-80"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "Скопировано" : "Копировать"}
            </Button>

            <Button
              variant="outline"
              onClick={handleShare}
              className="flex gap-2 !border-none transform transition-transform duration-150 active:scale-95 active:opacity-80"
            >
              <Share2 className="!border-none" size={18} /> Поделиться
            </Button>
          </div>

        </CardContent>
      </Card>

      <Button onClick={() => {
        setShowDialog(true)
      }} className='bg-destructive active:scale-95  hover:bg-red-800 text-white'><X/> Отменить Бронь</Button>


      <Card className="max-w-lg w-full h-full p-4 shadow-xl rounded-2xl">
        <CardHeader className="!border-none">
          <CardTitle className="text-center text-2xl !border-none">Наш Адрес</CardTitle>
        </CardHeader>


        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '8px', // скругление всего контейнера
            width: '100%',
            maxWidth: '560px', // адаптивная ширина
          }}
        >
          <a
            href="https://yandex.uz/maps/org/197913283981/?utm_medium=mapframe&utm_source=maps"
            style={{
              color: '#eee',
              fontSize: '12px',
              position: 'absolute',
              top: 0,
              left: '8px', // чтобы текст не прилегал к краю
              zIndex: 2,
              borderRadius: '8px',
            }}
          >
            Pdp University
          </a>

          <a
            href="https://yandex.uz/maps/10335/tashkent/category/university/184106140/?utm_medium=mapframe&utm_source=maps"
            style={{
              color: '#eee',
              fontSize: '12px',
              position: 'absolute',
              top: '24px', // чуть ниже первого
              left: '8px',
              zIndex: 2,
            }}
          >
            ВУЗ в Ташкенте
          </a>

          <iframe
            src="https://yandex.uz/map-widget/v1/?ll=69.213544%2C41.231232&mode=search&oid=197913283981&ol=biz&z=16"
            width="100%"
            height="400"
            frameBorder={0}
            allowFullScreen
            style={{
              display: 'block',
              border: '1px solid #e6e6e6',
              borderRadius: '8px', // скругление iframe
              boxSizing: 'border-box',
            }}
          ></iframe>
        </div>
      </Card>

      <Card className="max-w-lg w-full h-full p-4 shadow-xl rounded-2xl">
        <CardHeader className="!border-none">
          <CardTitle className="text-center text-2xl !border-none">Наши отзывы</CardTitle>
        </CardHeader>


        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            aspectRatio: '560 / 800', // сохраняет пропорции
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <iframe
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #e6e6e6',
              borderRadius: '8px',
              boxSizing: 'border-box',
            }}
            src="https://yandex.ru/maps-reviews-widget/197913283981?comments"
            title="Yandex Reviews"
          ></iframe>

          <a
            href="https://yandex.uz/maps/org/197913283981/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: 'none',
              color: '#b3b3b3',
              fontSize: '10px',
              fontFamily: 'YS Text, sans-serif',
              position: 'absolute',
              bottom: '8px',
              width: '100%',
              textAlign: 'center',
              left: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              maxHeight: '14px',
              whiteSpace: 'nowrap',
              padding: '0 16px',
              boxSizing: 'border-box',
            }}
          >
            Pdp University на карте Ташкента — Яндекс Карты
          </a>
        </div>


      </Card>


      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Отменить бронирование?</DialogTitle>
            <DialogDescription>
              Это действие необратимо. Вы не сможете восстановить запись после подтверждения.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowDialog(false)}
            >
              Назад
            </Button>

            <Button
              variant="destructive"
              onClick={handleCancelBooking}
            >
              Подтвердить отмену
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
