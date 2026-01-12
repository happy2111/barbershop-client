"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Copy,
  House,
  ImageDown,
  Share2,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { bookingService, BookingStatus } from "@/services/booking.service";
import domtoimage from "dom-to-image-more";
import { format, parseISO } from "date-fns";
import { uz } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface StatusMeta {
  label: string;
  note: string;
  color: string;
}

export default function BookingCheckClient({ id }: { id: number }) {
  const t = useTranslations("booking_check");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNote, setHasNote] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const router = useRouter();

  const statusMap = new Map<string, StatusMeta>([
    [
      "PENDING",
      {
        label: t("status.pending.label"),
        note: t("status.pending.note"),
        color: "bg-yellow-900/10",
      },
    ],
    [
      "CONFIRMED",
      {
        label: t("status.confirmed.label"),
        note: t("status.confirmed.note"),
        color: "bg-blue-900/10",
      },
    ],
    [
      "COMPLETED",
      {
        label: t("status.completed.label"),
        note: t("status.completed.note"),
        color: "bg-green-900/10",
      },
    ],
    [
      "CANCELLED",
      {
        label: t("status.cancelled.label"),
        note: t("status.cancelled.note"),
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
        setError(t("errors.load_failed"));
        setLoading(false);
      });
  }, [id]);

  const handleScreenshot = async () => {
    const element = document.getElementById("booking-check");
    if (!element || !booking) return;

    try {
      const dataUrl = await domtoimage.toPng(element, {
        quality: 1,
        style: {
          transform: "scale(2)",
          transformOrigin: "top left",
        },
        width: element.scrollWidth * 2,
        height: element.scrollHeight * 2,
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `booking-${booking.id}.png`;
      a.click();
      toast.success(t("toast.screenshot_saved"));
    } catch (err) {
      console.error("Ошибка создания скриншота:", err);
      toast.error(t("errors.screenshot_failed"));
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t("toast.link_copied"));
    } catch {
      toast.error(t("errors.copy_failed"));
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("share.title"),
          text: t("share.text"),
          url: window.location.href,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          toast.error(t("errors.share_failed"));
        }
      }
    } else {
      toast.info(t("errors.share_not_supported"));
    }
  };

  const handleCancelBooking = async () => {
    try {
      await bookingService.updateStatus(id, BookingStatus.CANCELLED);
      setShowDialog(false);
      toast.success(t("toast.booking_cancelled"));
      router.push("/");
    } catch (e) {
      console.error(e);
      toast.error(t("errors.cancel_failed"));
    }
  };

  if (loading) return <div className="text-center py-10">{t("loading")}</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (!booking) return <div className="text-center py-10">{t("errors.not_found")}</div>;

  if (booking.status === BookingStatus.CANCELLED) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-50">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          {t("cancelled.title")}
        </h1>
        <p className="max-w-xs mb-8 text-muted-foreground">
          {t("cancelled.description")}
        </p>

        <Button asChild variant="outline" className="gap-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            {t("buttons.back_home")}
          </Link>
        </Button>
      </div>
    );
  }

  const status = statusMap.get(booking.status);

  return (
    <div className="w-full min-h-screen relative flex flex-col gap-6 items-center justify-center p-4">
      {/* Шапка */}
      <div className="max-w-lg w-full flex items-center justify-between mb-4">
        <Link href="/" className="text-2xl font-bold">
          Ramitan Barbershop
        </Link>
        <Button onClick={() => router.push("/")}>
          <House className="mr-2 h-4 w-4" />
          {t("buttons.home")}
        </Button>
      </div>

      {/* Карточка брони */}
      <Card id="booking-check" className="max-w-lg w-full shadow-xl rounded-2xl">
        <CardHeader className="!border-none">
          <CardTitle className="text-center text-2xl !border-none">
            {t("card.title")}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 !border-none bordernone">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm ">
            <span className="text-muted-foreground">{t("fields.id")}:</span>
            <span className="font-medium">{booking.id}</span>

            <span className="text-muted-foreground">{t("fields.service")}:</span>
            <span className="font-medium">{booking.service?.name}</span>

            <span className="text-muted-foreground">{t("fields.price")}:</span>
            <span className="font-medium">
              {booking.service?.price} {t("common.sum")}
            </span>

            <span className="text-muted-foreground">{t("fields.master")}:</span>
            <span className="font-medium">{booking.specialist?.name}</span>

            <span className="text-muted-foreground">{t("fields.date")}:</span>
            <span className="font-medium">
              {booking.date
                ? format(parseISO(booking.date), "dd MMMM yyyy", { locale: uz })
                : "-"}
            </span>

            <span className="text-muted-foreground">{t("fields.time")}:</span>
            <span className="font-medium">
              {booking.start_time} — {booking.end_time}
            </span>

            <span className="text-muted-foreground">{t("fields.status")}:</span>
            <span className="font-medium">{status?.label}</span>
          </div>

          {hasNote && status && (
            <div
              className={`relative col-span-2 p-4 rounded-lg ${status.color} flex flex-col gap-2`}
            >
              <button
                onClick={() => setHasNote(false)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t("buttons.close_note")}
              >
                <X size={18} className='bordernone'/>
              </button>
              <span className="text-sm font-medium text-muted-foreground">
                {t("note.title")}:
              </span>
              <p className="text-sm">{status.note}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center pt-6">
            <Button
              onClick={handleScreenshot}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ImageDown size={18} className='bordernone'/>
              {t("buttons.save_png")}
            </Button>

            <Button
              variant="secondary"
              onClick={handleCopyLink}
              className="flex items-center gap-2"
            >
              {copied ? <Check size={18} className='bordernone' /> : <Copy size={18} className='bordernone' />}
              {copied ? t("buttons.copied") : t("buttons.copy_link")}
            </Button>

            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 size={18} className='bordernone'/>
              {t("buttons.share")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Кнопка отмены */}
      <Button
        onClick={() => setShowDialog(true)}
        variant="destructive"
        className="flex items-center gap-2"
      >
        <X size={18} />
        {t("buttons.cancel_booking")}
      </Button>

      {/* Карта */}
      <Card className="max-w-lg w-full shadow-xl rounded-2xl">
        <CardHeader className="!border-none">
          <CardTitle className="text-center text-2xl">
            {t("map.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-xl">
            <iframe
              src="https://yandex.uz/map-widget/v1/?ll=69.213544%2C41.231232&mode=search&oid=197913283981&ol=biz&z=16"
              width="100%"
              height="400"
              frameBorder={0}
              allowFullScreen
              className="rounded-xl"
            />
            <a
              href="https://yandex.uz/maps/org/197913283981/"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-500 hover:text-gray-700"
            >
              {t("map.link_text")}
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Отзывы */}
      <Card className="max-w-lg w-full shadow-xl rounded-2xl">
        <CardHeader className="!border-none">
          <CardTitle className="text-center text-2xl">
            {t("reviews.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-xl">
            <iframe
              src="https://yandex.ru/maps-reviews-widget/197913283981?comments"
              width="100%"
              height="500"
              frameBorder={0}
              title={t("reviews.iframe_title")}
              className="rounded-xl"
            />
            <a
              href="https://yandex.uz/maps/org/197913283981/"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-500 hover:text-gray-700"
            >
              {t("reviews.link_text")}
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Диалог подтверждения отмены */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("cancel_dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("cancel_dialog.description")}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t("buttons.back")}
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              {t("buttons.confirm_cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}