"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authStore } from "@/stores/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // если не указано — любой авторизованный пользователь
  redirectTo?: string;     // куда редиректить при запрете, по умолчанию /login
}

export default function ProtectedRoute({
                                         children,
                                         allowedRoles,
                                         redirectTo = "/login",
                                       }: ProtectedRouteProps) {
  const router = useRouter();
  const { isLoading, accessToken, user } = authStore();

  useEffect(() => {
    if (isLoading) return;

    if (!accessToken) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role || "")) {
      router.replace("/"); // или /403
      return;
    }
  }, [isLoading, accessToken, user, router, allowedRoles, redirectTo]);

  if (isLoading || !accessToken || (allowedRoles && !allowedRoles.includes(user?.role || ""))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
