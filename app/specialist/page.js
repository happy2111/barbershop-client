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

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
      </div>
    </ProtectedRoute>
  )
};

export default Page;