'use client';


import ProtectedRoute
  from "../../../components/Pretecters&Providers/ProtectedRouteProps";

export default function SpecialistProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['SPECIALIST']}>
      <div className="min-h-screen flex items-center justify-center">
        <h1>Добро пожаловать в профиль специалиста</h1>
      </div>
    </ProtectedRoute>
  );
}
