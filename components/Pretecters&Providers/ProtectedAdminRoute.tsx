"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authStore } from "@/stores/auth.store";

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const isLoading = authStore(state => state.isLoading);
  const user = authStore(state => state.user);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "ADMIN") {
        router.replace("/"); // или /403
      }
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
