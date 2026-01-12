// components/profile/ProfileBlockedTime.tsx
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { bookingService } from "@/services/booking.service";

type BlockedTime = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
};

const SHOW_LIMIT = 3;

const ProfileBlockedTime = () => {
  const t = useTranslations("profile.blocked_time");

  const [blocked, setBlocked] = useState<BlockedTime[]>([]);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const loadBlocked = async () => {
    try {
      const data = await bookingService.getBlockedTimes();
      setBlocked(data);
    } catch (e) {
      console.error("Failed to load blocked times", e);
    }
  };

  useEffect(() => {
    loadBlocked();
  }, []);

  const onBlock = async () => {
    if (!date || !start || !end) return;

    setLoading(true);
    try {
      await bookingService.block(date, start, end, reason || undefined);
      await loadBlocked();
      setDate("");
      setStart("");
      setEnd("");
      setReason("");
      setOpen(false);
    } catch (e: any) {
      // Можно добавить toast.error здесь, если нужно
      console.error("Failed to block time", e);
    } finally {
      setLoading(false);
    }
  };

  const visibleItems = showAll ? blocked : blocked.slice(0, SHOW_LIMIT);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">{t("add_button")}</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialog.title")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t("dialog.date_label")}</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t("dialog.start_label")}</label>
                  <Input
                    type="time"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t("dialog.end_label")}</label>
                  <Input
                    type="time"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t("dialog.reason_label")}</label>
                <Input
                  placeholder={t("dialog.reason_placeholder")}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <Button
                onClick={onBlock}
                disabled={loading || !date || !start || !end}
                className="w-full"
              >
                {loading ? t("dialog.blocking") : t("dialog.block_button")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-3">
        {blocked.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("no_blocked_times")}
          </p>
        ) : (
          <>
            {visibleItems.map((b) => (
              <div
                key={b.id}
                className="border rounded-lg p-3 flex justify-between items-start gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {new Date(b.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {b.start_time} – {b.end_time}
                  </p>
                  {b.reason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("reason_prefix")}: {b.reason}
                    </p>
                  )}
                </div>

                <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground whitespace-nowrap">
                  {t("system_label")}
                </span>
              </div>
            ))}

            {blocked.length > SHOW_LIMIT && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full justify-center"
              >
                {showAll ? t("show_less") : t("show_more")}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileBlockedTime;