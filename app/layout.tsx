import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import {ThemeProvider} from "@/components/theme-provider";
import {ModeToggle} from "@/components/ModeToggle";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {TelegramProvider} from "@/context/TelegramContext";
import Script from "next/script";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_TITLE || "Название по умолчанию",
  description: process.env.NEXT_PUBLIC_DESCRIPTION,
  openGraph: {
    title: process.env.NEXT_PUBLIC_TITLE,
    description: process.env.NEXT_PUBLIC_DESCRIPTION,
    url: process.env.NEXT_PUBLIC_OG_URL,
    images: [
      {
        url: process.env.NEXT_PUBLIC_OG_IMAGE || "/default-og.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: process.env.NEXT_PUBLIC_OG_LOCALE || "ru_RU",
    type: "website",
  },
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
