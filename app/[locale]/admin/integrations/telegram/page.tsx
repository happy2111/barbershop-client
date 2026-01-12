"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { integrationService, TelegramStatus } from "@/services/integration.service";
import { Send, Loader2, Trash2, CheckCircle2, Clock, Copy, Hash, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function TelegramIntegrationPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TelegramStatus | null>(null);

  // Состояния для процесса привязки
  const [step, setStep] = useState(1);
  const [tokenData, setTokenData] = useState<{ token: string, expiresAt: string } | null>(null);
  const [chatId, setChatId] = useState("");
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. ПРОВЕРКА СТАТУСА ПРИ ЗАГРУЗКЕ
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await integrationService.getTelegramStatus();
        // Если сервер вернул { enabled: true, chatId: "..." }
        setStatus(data);
      } catch (error) {
        console.error("Status check failed", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 2. ТАЙМЕР ОБРАТНОГО ОТСЧЕТА (для Step 2)
  useEffect(() => {
    if (!tokenData) return;
    const interval = setInterval(() => {
      const distance = new Date(tokenData.expiresAt).getTime() - new Date().getTime();
      if (distance < 0) {
        clearInterval(interval);
        setTokenData(null);
        setStep(1);
        toast.error("Срок действия токена истек");
      } else {
        const m = Math.floor((distance % 3600000) / 60000);
        const s = Math.floor((distance % 60000) / 1000);
        setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tokenData]);

  const handleGenerateToken = async () => {
    try {
      setIsSubmitting(true);
      const { data } = await integrationService.generateTelegramToken();
      setTokenData(data);
      setStep(2);
    } catch (error) {
      toast.error("Ошибка генерации токена");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBind = async () => {
    if (!chatId || !tokenData) return;
    try {
      setIsSubmitting(true);
      await integrationService.bindTelegram({ token: tokenData.token, chatId: chatId.trim() });
      toast.success("Telegram подключен");
      setTokenData(null);
      // Обновляем статус, чтобы показать экран успеха
      const { data } = await integrationService.getTelegramStatus();
      setStatus(data);
    } catch (error) {
      toast.error("Не удалось привязать Chat ID");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnbind = async () => {
    if (!confirm("Отключить Telegram уведомления?")) return;
    try {
      await integrationService.unbindTelegram();
      setStatus({ isLinked: false, enabled: false }); // Сбрасываем локально
      setStep(1);
      toast.success("Интеграция удалена");
    } catch (error) {
      toast.error("Ошибка при удалении");
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium">Проверка интеграции...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Send className="text-[#0088cc] w-9 h-9" /> Telegram Группа
        </h1>
      </div>

      {/* УСЛОВИЕ: ЕСЛИ УЖЕ ПРИВЯЗАН (enabled: true) */}
      {(status?.enabled || status?.isLinked) ? (
        <Card className="border-none shadow-2xl bg-gradient-to-b from-green-500/10 to-background overflow-hidden">
          <div className="p-1 w-full bg-green-500" /> {/* Полоска сверху */}
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20 rotate-3">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-foreground">Связь установлена</h2>
            <p className="text-muted-foreground mt-2">
              Ваша группа успешно подключена к системе уведомлений.
            </p>

            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-2xl border">
              <Hash className="w-4 h-4 text-primary" />
              <span className="font-mono font-bold text-sm">ID: {status.chatId}</span>
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <Button variant="outline" className="h-12 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5" onClick={handleUnbind}>
                <Trash2 className="w-4 h-4 mr-2" /> Отключить интеграцию
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* --- ОСТАЛЬНАЯ ЛОГИКА (ШАГИ 1 и 2) --- */
        <div className="space-y-6">
          {step === 1 && (
            <Card className="border-none shadow-lg bg-card">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Подключение уведомлений</h3>
                  <p className="text-sm text-muted-foreground">Следуйте инструкции для настройки группы</p>
                </div>

                <div className="space-y-4 py-2">
                  {[
                    "Добавьте бота в группу и сделайте его админом",
                    "Напишите любое сообщение в группу",
                    "Получите Chat ID вашей группы"
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{i+1}</span>
                      <p className="text-sm font-medium pt-1">{text}</p>
                    </div>
                  ))}
                </div>

                <Button className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20" onClick={handleGenerateToken} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Начать подключение"}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && tokenData && (
            <Card className="border-2 border-primary/20 shadow-2xl animate-in fade-in zoom-in duration-300">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
                  <div className="flex items-center gap-2 text-orange-600 font-bold">
                    <Clock className="w-5 h-5" />
                    <span>Токен активен:</span>
                  </div>
                  <span className="font-mono text-xl font-black text-orange-600 tracking-tighter">{timeLeft}</span>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ваш проверочный токен</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={tokenData.token} className="h-12 bg-muted/50 font-mono text-xs rounded-xl border-dashed" />
                      <Button variant="secondary" size="icon" className="h-12 w-12 rounded-xl" onClick={() => {
                        navigator.clipboard.writeText(tokenData.token);
                        toast.success("Скопировано");
                      }}><Copy className="w-4 h-4" /></Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Введите Chat ID группы *</Label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <Input
                        placeholder="-100..."
                        className="pl-12 h-14 rounded-2xl text-lg font-medium shadow-inner"
                        value={chatId}
                        onChange={(e) => setChatId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button variant="ghost" className="h-14 rounded-2xl flex-1" onClick={() => setStep(1)}>Отмена</Button>
                  <Button className="h-14 rounded-2xl flex-[2] text-base font-bold" onClick={handleBind} disabled={isSubmitting || !chatId}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Завершить настройку"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}