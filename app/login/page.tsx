"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authStore } from "@/stores/auth.store";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SpecialistLoginPage() {
  const router = useRouter();

  const login = authStore((state) => state.login);
  const { isLoading, accessToken, user } = authStore();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);


    const ok = await login(phone, password);

    if (!ok) {
      toast.error("Неверный телефон или пароль");
      return;
    }

    setLoading(false);
    toast.success("Успешный вход!");

    const unsubscribe = authStore.subscribe((state) => {
      if (state.user && state.accessToken) {
        unsubscribe(); // отписываемся сразу

        if (state.user.role === "ADMIN") {
          router.replace("/admin");
        } else {
          router.replace("/specialist/profile");
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <Card className="w-full max-w-md bg-card text-card-foreground border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">
            Вход для специалиста
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* PHONE */}
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-foreground">
                Телефон
              </Label>
              <Input
                id="phone"
                type="text"
                placeholder="+998901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-input border border-input text-foreground"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-foreground">
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border border-input text-foreground"
                required
              />
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
