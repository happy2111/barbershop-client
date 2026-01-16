import type {Metadata} from "next";
import "./globals.css";
import {Toaster} from "@/components/ui/sonner"
import {ThemeProvider} from "@/components/Pretecters&Providers/theme-provider";
import {ModeToggle} from "@/components/ModeToggle";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {TelegramProvider} from "@/context/TelegramContext";
import Script from "next/script";

import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function RootLayout({
                                           children,
                                           params
                                         }: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
    >
    <head>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
    </head>
    <body className="antialiased" suppressHydrationWarning>
    <NextIntlClientProvider>
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
            <Footer/>
          </div>
          <Toaster />
        </ThemeProvider>
      </TelegramProvider>
    </NextIntlClientProvider>
    </body>
    </html>
  );
}
