// components/profile/ProfileServices.tsx
import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Service {
  id: string;
  name: string;
  duration_min: number;
  price: number;
  photo?: string | null;
}

interface ProfileServicesProps {
  profile: {
    services: Service[];
  };
}

const ProfileServices = ({ profile }: ProfileServicesProps) => {
  const t = useTranslations('profile.services');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {profile.services.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t('no_services')}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.services.map((service) => (
              <div
                key={service.id}
                className="border rounded-lg p-4 flex items-start gap-4 hover:shadow-sm transition-shadow"
              >
                {service.photo && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${service.photo}`}
                    alt={service.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base truncate">
                    {service.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('duration', { minutes: service.duration_min })}
                  </p>
                  <p className="text-lg font-bold text-primary mt-1">
                    {t('price', { amount: service.price })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileServices;