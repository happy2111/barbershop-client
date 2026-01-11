"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Send, MessageSquare, ChevronRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const integrations = [
  {
    id: 'telegram',
    name: 'Telegram Bot',
    description: 'Уведомления о новых записях и отчеты в вашу группу или личку.',
    icon: <Send className="w-8 h-8 text-[#0088cc]" />,
    status: 'available', // может быть 'connected'
    path: '/admin/integrations/telegram'
  },
  // {
  //   id: 'whatsapp',
  //   name: 'WhatsApp Business',
  //   description: 'Автоматическая рассылка напоминаний клиентам через WhatsApp.',
  //   icon: <MessageSquare className="w-8 h-8 text-[#25D366]" />,
  //   status: 'soon',
  //   path: '#'
  // }
];

export default function IntegrationsPage() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Интеграции</h1>
        <p className="text-muted-foreground mt-2">Подключите сторонние сервисы для автоматизации вашего бизнеса</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((item) => (
          <Card
            key={item.id}
            className={`group cursor-pointer transition-all hover:shadow-md border-2 ${item.status === 'soon' ? 'opacity-60 grayscale' : 'hover:border-primary/50'}`}
            onClick={() => item.status !== 'soon' && router.push(item.path)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-muted group-hover:bg-primary/5 transition-colors">
                  {item.icon}
                </div>
                {item.status === 'soon' ? (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary px-2 py-1 rounded-md">Скоро</span>
                ) : (
                  <ChevronRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold">{item.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}