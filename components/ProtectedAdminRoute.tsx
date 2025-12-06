"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {authStore} from "@/stores/auth.store";

export default function ProtectedAdminRoute({
                                              children,
                                            }: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading, accessToken, user } = authStore();

  useEffect(() => {
    if (isLoading) return;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.replace("/"); // или /403
      return;
    }
  }, [isLoading, accessToken, user, router]);

  if (isLoading || !accessToken || user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Всё ок — пускаем в админку
  return <>{children}</>;
}