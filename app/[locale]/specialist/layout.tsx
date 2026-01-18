'use client';

import ProtectedRoute from '@/components/Pretecters&Providers/ProtectedRouteProps';

export default function SpecialistLayout({
                                           children,
                                         }: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['SPECIALIST', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}
