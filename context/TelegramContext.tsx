'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TelegramContextType {
  webApp?: TelegramWebApp;
  user?: TelegramUser;
  initData: string;
  isFullscreen: boolean;
  topInset: number;
}


const TelegramContext = createContext<TelegramContextType>({
  isFullscreen: false,
  topInset: 0,
  initData: '' });

export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<TelegramContextType>({
    initData: '',
    isFullscreen: false,
    topInset: 0,
  });

  useEffect(() => {
    const tg: any = window?.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();

    const updateLayout = () => {
      const topInset =
        tg.contentSafeAreaInset?.top ??
        tg.safeAreaInset?.top ??
        0;

      setData({
        webApp: tg,
        user: tg.initDataUnsafe?.user,
        initData: tg.initData,
        isFullscreen: tg.isFullscreen,
        topInset,
      });

      // CSS variable — лучший способ
      document.documentElement.style.setProperty(
        '--tg-safe-top',
        `${topInset}px`
      );
    };

    updateLayout();

    tg.onEvent('viewportChanged', updateLayout);

    return () => {
      tg.offEvent('viewportChanged', updateLayout);
    };
  }, []);

  return (
    <TelegramContext.Provider value={data}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);