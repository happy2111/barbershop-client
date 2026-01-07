'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TelegramContextType {
  webApp?: TelegramWebApp;
  user?: TelegramUser;
  initData: string;
}

const TelegramContext = createContext<TelegramContextType>({ initData: '' });

export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<TelegramContextType>({ initData: '' });

  useEffect(() => {
    // Используем интервал или проверку, так как скрипт может грузиться асинхронно
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

    if (tg) {
      tg.ready();
      tg.expand();

      setData({
        webApp: tg,
        user: tg.initDataUnsafe?.user,
        initData: tg.initData,
      });
    }
  }, []);

  return (
    <TelegramContext.Provider value={data}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);