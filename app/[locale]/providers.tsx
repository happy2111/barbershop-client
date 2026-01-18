"use client";

import { useEffect, useRef } from "react";
import { authStore } from "@/stores/auth.store";
import {printMe} from "@/lib/utils";

export function Providers({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    authStore.getState().initialize();

    printMe()

  }, []);

  return <>{children}</>;
}
