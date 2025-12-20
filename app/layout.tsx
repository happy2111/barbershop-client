
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import {ThemeProvider} from "@/components/theme-provider";
import {ModeToggle} from "@/components/ModeToggle";
import {authStore} from "@/stores/auth.store";
import {Nav} from "react-day-picker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Romitan Barbershop",
  description: "Барбершоп в Бухара с онлайн-бронированием. Мужские стрижки, борода, укладка и уход за волосами. Быстрое бронирование через сайт без очереди.\n",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className="antialiased" suppressHydrationWarning>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
        <div className="w-full mb-8">
          <Navbar/>
          {children}
          <ModeToggle />
          <Footer/>
        </div>
        <Toaster />
    </ThemeProvider>
    </body>
    </html>
  );
}
