// // components/TelegramProvider.tsx
// 'use client';
//
// import { useEffect, useState } from 'react';
// import { init, backButton, viewport, themeParams } from '@telegram-apps/sdk';
//
// export function TelegramProvider({ children }: { children: React.ReactNode }) {
//   const [isInitialized, setIsInitialized] = useState(false);
//
//   useEffect(() => {
//     try {
//       // Инициализируем базовые настройки SDK
//       init();
//
//       // Монтируем необходимые компоненты
//       if (backButton.isSupported()) backButton.mount();
//       if (viewport.isSupported()) viewport.mount();
//       themeParams.mount();
//
//       setIsInitialized(true);
//     } catch (e) {
//       console.error('Ошибка инициализации TMA SDK:', e);
//       // На десктопе в обычном браузере может упасть, это нормально
//       setIsInitialized(true);
//     }
//   }, []);
//
//   if (!isInitialized) return null;
//
//   return <>{children}</>;
// }