"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { integrationService, TelegramStatus } from "@/services/integration.service";
import { Send, Loader2, Trash2, Clock, Copy, Hash, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function TelegramIntegrationPage() {
  // Инициализируем переводы для секции telegram
  const t = useTranslations('admin.integrations.telegram');

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TelegramStatus | null>(null);

  const [step, setStep] = useState(1);
  const [tokenData, setTokenData] = useState<{ token: string, expiresAt: string } | null>(null);
  const [chatId, setChatId] = useState("");
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. ПРОВЕРКА СТАТУСА
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await integrationService.getTelegramStatus();
        setStatus(data);
      } catch (error) {
        console.error("Status check failed", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 2. ТАЙМЕР
  useEffect(() => {
    if (!tokenData) return;
    const interval = setInterval(() => {
      const distance = new Date(tokenData.expiresAt).getTime() - new Date().getTime();
      if (distance < 0) {
        clearInterval(interval);
        setTokenData(null);
        setStep(1);
        toast.error(t('toast.token_expired'));
      } else {
        const m = Math.floor((distance % 3600000) / 60000);
        const s = Math.floor((distance % 60000) / 1000);
        setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tokenData, t]);

  const handleGenerateToken = async () => {
    try {
      setIsSubmitting(true);
      const { data } = await integrationService.generateTelegramToken();
      setTokenData(data);
      setStep(2);
      toast.success(t('toast.token_generated'));
    } catch (error) {
      toast.error(t('toast.token_generation_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBind = async () => {
    if (!chatId || !tokenData) return;
    try {
      setIsSubmitting(true);
      await integrationService.bindTelegram({ token: tokenData.token, chatId: chatId.trim() });
      toast.success(t('toast.connected'));
      setTokenData(null);
      const { data } = await integrationService.getTelegramStatus();
      setStatus(data);
    } catch (error) {
      toast.error(t('toast.bind_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnbind = async () => {
    if (!confirm(t('confirm.disconnect'))) return;
    try {
      await integrationService.unbindTelegram();
      setStatus({ isLinked: false, enabled: false });
      setStep(1);
      toast.success(t('toast.disconnected'));
    } catch (error) {
      toast.error(t('toast.disconnect_failed'));
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium">{t('loading')}</p>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Send className="text-[#0088cc] w-9 h-9" /> {t('title')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>

      {(status?.enabled || status?.isLinked) ? (
        <Card className="border-none shadow-2xl bg-gradient-to-b from-green-500/10 to-background overflow-hidden">
          <div className="p-1 w-full bg-green-500" />
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20 rotate-3">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-foreground">{t('connected.title')}</h2>
            <p className="text-muted-foreground mt-2">
              {t('connected.description')}
            </p>

            {status.chatId && (
              <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-2xl border">
                <Hash className="w-4 h-4 text-primary" />
                <span className="font-mono font-bold text-sm">ID: {status.chatId}</span>
              </div>
            )}

            <div className="mt-10 flex flex-col gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5"
                onClick={handleUnbind}
              >
                <Trash2 className="w-4 h-4 mr-2" /> {t('buttons.disconnect')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {step === 1 && (
            <Card className="border-none shadow-lg bg-card">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t('step1.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('step1.subtitle')}</p>
                </div>

                <div className="space-y-4 py-2">
                  {/* Мапим массив инструкций из локалей */}
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium pt-1">
                        {t(`step1.instructions.${index}`)}
                      </p>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20"
                  onClick={handleGenerateToken}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : t('step1.button')}
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
                    <span>{t('step2.token_expires')}:</span>
                  </div>
                  <span className="font-mono text-xl font-black text-orange-600 tracking-tighter">{timeLeft}</span>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      {t('step2.token_label')}
                    </Label>
                    <div className="flex gap-2">
                      <Input readOnly value={tokenData.token} className="h-12 bg-muted/50 font-mono text-xs rounded-xl border-dashed" />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-12 w-12 rounded-xl"
                        onClick={() => {
                          navigator.clipboard.writeText(tokenData.token);
                          toast.success(t('toast.copied'));
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold">{t('step2.chat_id_label')} *</Label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <Input
                        placeholder={t('step2.chat_id_placeholder')}
                        className="pl-12 h-14 rounded-2xl text-lg font-medium shadow-inner"
                        value={chatId}
                        onChange={(e) => setChatId(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground px-1">{t('step2.chat_id_hint')}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button variant="ghost" className="h-14 rounded-2xl flex-1" onClick={() => setStep(1)}>
                    {t('buttons.back')}
                  </Button>
                  <Button
                    className="h-14 rounded-2xl flex-[2] text-base font-bold"
                    onClick={handleBind}
                    disabled={isSubmitting || !chatId}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : t('step2.button')}
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