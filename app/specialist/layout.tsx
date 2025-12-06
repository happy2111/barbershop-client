'use client';

import { useEffect } from 'react';
import { authStore } from '@/stores/auth.store';

export default function SpecialistLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    authStore.getState().initialize();
  }, []);

  return <>{children}</>;
}