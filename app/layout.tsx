
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import {ThemeProvider} from "@/components/theme-provider";
import {ModeToggle} from "@/components/ModeToggle";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
