"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authStore } from "@/stores/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("ADMIN" | "SPECIALIST")[];
  redirectTo?: string;
}

export default function ProtectedRoute({
                                         children,
                                         allowedRoles,
                                         redirectTo = "/login",
                                       }: ProtectedRouteProps) {
  const router = useRouter();

  const isLoading = authStore(state => state.isLoading);
  const user = authStore(state => state.user);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace(redirectTo);
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.replace("/403");
      }
    }
  }, [isLoading, user, router, allowedRoles, redirectTo]);

  const isUnauthorized = !user || (allowedRoles && !allowedRoles.includes(user?.role));

  if (isLoading || isUnauthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
