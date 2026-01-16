"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from "@/components/ui/card";
import { Send, ChevronRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

const integrations = [
  {
    id: 'telegram',
    key: 'telegram',
    icon: <Send className="w-8 h-8 text-[#0088cc]" />,
    status: 'available',
    path: '/admin/integrations/telegram'
  },
  // {
  //   id: 'whatsapp',
  //   key: 'whatsapp',
  //   icon: <MessageSquare className="w-8 h-8 text-[#25D366]" />,
  //   status: 'soon',
  //   path: '#'
  // }
];

export default function IntegrationsPage() {
  const t = useTranslations('admin.integrations');
  const router = useRouter();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground mt-3">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <Card
            key={item.id}
            className={`
              group relative overflow-hidden transition-all duration-300
              hover:shadow-xl hover:-translate-y-1
              border-2 ${item.status === 'soon'
              ? 'opacity-70 grayscale border-dashed'
              : 'hover:border-primary/60 cursor-pointer'}
            `}
            onClick={() => item.status !== 'soon' && router.push(item.path)}
          >
            <CardContent className="p-7">
              <div className="flex items-start justify-between mb-6">
                <div className={`
                  p-4 rounded-2xl transition-colors
                  ${item.status === 'soon'
                  ? 'bg-muted'
                  : 'bg-primary/5 group-hover:bg-primary/10'}
                `}>
                  {item.icon}
                </div>

                {item.status === 'soon' ? (
                  <span className="text-xs font-bold uppercase tracking-wider bg-secondary px-3 py-1.5 rounded-full">
                    {t('status.soon')}
                  </span>
                ) : (
                  <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                )}
              </div>

              <h3 className="text-xl font-bold mb-2">
                {t(`items.${item.key}.name`)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`items.${item.key}.description`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}