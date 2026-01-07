
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import {ThemeProvider} from "@/components/theme-provider";
import {ModeToggle} from "@/components/ModeToggle";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {TelegramProvider} from "@/context/TelegramContext";
import Script from "next/script"; // Импортируем Script

export const metadata: Metadata = {
  title: "Romitan Barbershop",
  description: "Барбершоп в Бухара с онлайн-бронированием. Мужские стрижки, борода, укладка и уход за волосами. Быстрое бронирование через сайт без очереди.\n",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
    <head>
      {/* Загружаем скрипт ПЕРЕД интерактивностью */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
    </head>
    <body className="antialiased" suppressHydrationWarning>
      <TelegramProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="w-full mb-8 tg-safe-top">
            <Navbar/>
            {children}
            <ModeToggle />
            <Footer/>
          </div>
          <Toaster />
        </ThemeProvider>
      </TelegramProvider>

    </body>
    </html>
  );
}
