"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authStore } from "@/stores/auth.store";
import { Eye, EyeOff, Phone, Lock, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { PatternFormat } from "react-number-format";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SpecialistLoginPage() {
  const t = useTranslations();
  const router = useRouter();

  const login = authStore((state) => state.login);
  const { isLoading, user } = authStore();

  const [phone, setPhone] = useState(""); // Здесь будут только цифры (998...)
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      router.replace(
        user.role === "ADMIN" ? "/admin" : "/specialist/profile"
      );
    }
  }, [isLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formattedPhone = `+998${phone}`;
    const ok = await login(formattedPhone, password);

    setLoading(false);

    if (!ok) {
      toast.error(t("toast.login_error"));
      return;
    }

    toast.success(t("toast.login_success"));
  };


  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background p-4">
      <Card className="w-full max-w-[400px] shadow-xl border-border/50 backdrop-blur-sm bg-card/95 rounded-[2rem]">
        <CardHeader className="space-y-1 pb-6 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t("auth.login.title")}
          </CardTitle>
          <CardDescription>
            {t("auth.login.description")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="phone" className="ml-1 text-xs font-semibold uppercase tracking-wider opacity-70">
                {t("auth.login.phone_label")}
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <PatternFormat
                  id="phone"
                  format="+998 (##) ###-##-##"
                  mask="_"
                  customInput={Input} // Используем ваш UI-компонент Input
                  value={phone}
                  onValueChange={(values) => {
                    setPhone(values.value);
                  }}
                  placeholder="+998 (__) ___-__-__"
                  className="pl-11 h-12 text-lg rounded-2xl transition-all focus:ring-2 focus:ring-primary/20 tracking-wide font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.login.password_label")}</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.login.password_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-10 h-12 rounded-2xl transition-all focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
              disabled={loading || phone.length < 9} // Блокируем, пока номер не введен полностью
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t("auth.login.loading_button")}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  {t("auth.login.submit_button")}
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}