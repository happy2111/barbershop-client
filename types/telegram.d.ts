// types/telegram.d.ts
export {};

declare global {
  interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    allows_write_to_pm?: boolean;
    photo_url?: string;
  }

  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
      query_id?: string;
      user?: TelegramUser;
      auth_date: string;
      hash: string;
    };
    ready(): void;
    expand(): void;
    close(): void;
    MainButton: any; // Можно типизировать глубже при необходимости
    BackButton: any;
    themeParams: any;
    colorScheme: 'light' | 'dark';
  }

  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}