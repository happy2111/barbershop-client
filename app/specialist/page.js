'use client';

import { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { authStore } from "../../stores/auth.store";
import ProtectedRoute from "../../components/ProtectedRouteProps";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      await authStore.getState().initialize(); // ← пытаемся восстановить сессию

      const isAuth = authStore.getState().isAuth();
      const isLoading = authStore.getState().isLoading;

      if (isLoading) {
        // можно показать лоадер, но обычно initialize быстро
        return;
      }

      if (isAuth) {
        router.push('/specialist/profile');
      } else {
        router.push('/specialist/login');
      }
    };

    init();
  }, [router]);

  // Пока идёт инициализация — показываем лоадер
  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-screen">
        <div>Проверка авторизации...</div>
      </div>
    </ProtectedRoute>
  );
};

export default Page;