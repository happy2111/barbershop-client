"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const texts = {
  ru: {
    title: "Публичная оферта\nо предоставлении доступа к сервису HYCO",
    sections: [
      {
        num: "1.",
        title: "Общие положения",
        content:
          "Настоящий документ является публичной офертой. Оплата услуг означает полное и безоговорочное принятие Клиентом условий настоящей оферты.",
      },
      {
        num: "2.",
        title: "Предмет договора",
        content:
          "Исполнитель предоставляет Клиенту доступ к онлайн-сервису HYCO, предназначенному для управления записями, клиентами, услугами и расписанием компании.",
      },
      {
        num: "3.",
        title: "Подписка и оплата",
        content:
          "Услуги предоставляются по подписке сроком 30 календарных дней. Оплата производится авансом. При отсутствии оплаты доступ к сервису может быть приостановлен до момента поступления платежа.",
      },
      {
        num: "4.",
        title: "Права и обязанности сторон",
        content:
          "Исполнитель обязуется обеспечивать работоспособность сервиса и доступ к его основным функциям.\nКлиент обязуется использовать сервис по назначению и не нарушать условия настоящей оферты.",
      },
      {
        num: "5.",
        title: "Поддержка",
        content:
          "Поддержка включает консультации по работе сервиса и исправление технических ошибок. Индивидуальные доработки, изменения логики и функционала оплачиваются отдельно по согласованию сторон.",
      },
      {
        num: "6.",
        title: "Ответственность",
        content:
          "Исполнитель не несёт ответственности за упущенную выгоду, потерю дохода, клиентов или данных, возникшие вследствие действий Клиента, третьих лиц, перебоев в работе интернета, оборудования или внешних сервисов.",
      },
      {
        num: "7.",
        title: "Возврат средств",
        content:
          "Возврат оплаченной подписки возможен в течение 3 (трёх) календарных дней с момента оплаты при условии обращения Клиента в службу поддержки. По истечении указанного срока средства возврату не подлежат.",
      },
      {
        num: "8.",
        title: "Расторжение договора",
        content:
          "Клиент вправе отказаться от использования сервиса в любой момент. В случае отказа доступ сохраняется до окончания оплаченного периода, если иное не предусмотрено условиями возврата.",
      },
      {
        num: "9.",
        title: "Заключительные положения",
        content:
          "Договор вступает в силу с момента оплаты услуг и действует в течение оплаченного периода подписки.",
      },
    ],
  },

  uz: {
    title: "HYCO xizmatiga kirishni taqdim etish to‘g‘risidagi\nOmmaviy oferta",
    sections: [
      {
        num: "1.",
        title: "Umumiy qoidalar",
        content:
          "Ushbu hujjat ommaviy oferta hisoblanadi. Xizmatlar uchun to‘lov amalga oshirilishi bilan Mijoz ushbu oferta shartlarini to‘liq va so‘zsiz qabul qilgan hisoblanadi.",
      },
      {
        num: "2.",
        title: "Shartnoma predmeti",
        content:
          "Ijrochi Mijozga HYCO onlayn-xizmatiga kirish huquqini beradi. Ushbu xizmat kompaniyaning yozuvlari, mijozlari, xizmatlari va jadvalini boshqarish uchun mo‘ljallangan.",
      },
      {
        num: "3.",
        title: "Obuna va to‘lov",
        content:
          "Xizmatlar 30 kalendar kunlik obuna asosida taqdim etiladi. To‘lov oldindan amalga oshiriladi. To‘lov bo‘lmasa, xizmatga kirish to‘lov kelib tushgunga qadar to‘xtatilishi mumkin.",
      },
      {
        num: "4.",
        title: "Tomonlarning huquq va majburiyatlari",
        content:
          "Ijrochi xizmatning ishlashini va uning asosiy funksiyalariga kirishni ta’minlashga majburdir.\nMijoz xizmatni maqsadiga muvofiq ishlatishi va oferta shartlarini buzmasligi shart.",
      },
      {
        num: "5.",
        title: "Qo‘llab-quvvatlash",
        content:
          "Qo‘llab-quvvatlash xizmat ishiga oid maslahatlar va texnik xatolarni tuzatishni o‘z ichiga oladi. Individual qayta ishlash, logika va funksionallik o‘zgartirishlari tomonlar kelishuvi bo‘yicha alohida to‘lanadi.",
      },
      {
        num: "6.",
        title: "Javobgarlik",
        content:
          "Ijrochi Mijoz, uchinchi shaxslar harakatlari, internet, uskunalar yoki tashqi xizmatlar uzilishlari natijasida yuzaga kelgan foyda yo‘qotilishi, daromad, mijozlar yoki ma’lumotlar yo‘qolishi uchun javobgar emas.",
      },
      {
        num: "7.",
        title: "Pullarni qaytarish",
        content:
          "To‘langan obuna pullari to‘lov sanasidan boshlab 3 (uch) kalendar kun ichida qo‘llab-quvvatlash xizmatiga murojaat qilinganda qaytarilishi mumkin. Belgilangan muddat o‘tgach pullar qaytarilmaydi.",
      },
      {
        num: "8.",
        title: "Shartnomani bekor qilish",
        content:
          "Mijoz xizmatdan foydalanishni istalgan vaqtda rad etishi mumkin. Rad etilgan taqdirda, agar qaytarish shartlarida boshqacha ko‘rsatilmagan bo‘lsa, to‘langan davr oxirigacha kirish saqlanib qoladi.",
      },
      {
        num: "9.",
        title: "Yakuniy qoidalar",
        content:
          "Shartnoma xizmatlar uchun to‘lov amalga oshirilgan paytdan kuchga kiradi va to‘langan obuna davri davomida amal qiladi.",
      },
    ],
  },
};

export default function OfertaPage() {
  const [lang, setLang] = useState<"ru" | "uz">("ru");
  const { theme, setTheme } = useTheme();
  const t = texts[lang];

  // Для гидратации (чтобы не было несоответствия server/client)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className="mx-auto max-w-4xl px-5 py-12 md:py-16 lg:py-20">
        {/* Заголовок + переключатели */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="whitespace-pre-line text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
            {t.title}
          </h1>

          <div className="flex items-center gap-3">
            {/* Переключение языка */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLang("ru")}>
                  Русский
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("uz")}>
                  O‘zbekcha
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Переключение темы */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Основной контент */}
        <div className="prose prose-lg max-w-none dark:prose-invert md:prose-xl">
          {t.sections.map((section) => (
            <section key={section.num} className="mb-10 last:mb-0">
              <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight md:text-3xl">
                <span className="inline-block min-w-[2.5rem] rounded-md bg-primary/10 px-2.5 py-1 text-primary dark:bg-primary/20">
                  {section.num}
                </span>
                {section.title}
              </h2>

              <div className="leading-relaxed text-muted-foreground">
                {section.content.split("\n").map((line, i) => (
                  <p key={i} className="mb-4 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Футер / дата */}
        <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>HYCO • {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Ваш существующий компонент ModeToggle (оставил на всякий случай) */}
      {/* <ModeToggle /> */}
    </div>
  );
}