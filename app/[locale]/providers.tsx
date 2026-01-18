"use client";

import { useEffect, useRef } from "react";
import { authStore } from "@/stores/auth.store";

export function Providers({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    authStore.getState().initialize();
  }, []);

  return <>{children}</>;
}
