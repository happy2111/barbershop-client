import React, { useEffect, useState } from "react";
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
  const [blocked, setBlocked] = useState<BlockedTime[]>([]);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const loadBlocked = async () => {
    const data = await bookingService.getBlockedTimes();
    setBlocked(data);
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
    } finally {
      setLoading(false);
    }
  };

  const visibleItems = showAll ? blocked : blocked.slice(0, SHOW_LIMIT);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Заблокированное время</CardTitle>

        {/* Кнопка открытия диалога */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Добавить</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Блокировка времени</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <Input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
              <Input
                placeholder="Причина (необязательно)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <Button onClick={onBlock} disabled={loading} className="w-full">
                Заблокировать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-3">
        {blocked.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Нет заблокированного времени
          </p>
        )}

        {visibleItems.map((b) => (
          <div
            key={b.id}
            className="border rounded-lg p-3 flex justify-between items-start"
          >
            <div>
              <p className="font-medium">
                {new Date(b.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                {b.start_time} – {b.end_time}
              </p>

              {b.reason && (
                <p className="text-xs text-muted-foreground mt-1">
                  Причина: {b.reason}
                </p>
              )}
            </div>

            <span className="text-xs px-2 py-1 rounded bg-foreground text-background">
              SYSTEM
            </span>
          </div>
        ))}

        {blocked.length > SHOW_LIMIT && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Скрыть" : "Показать ещё"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileBlockedTime;
