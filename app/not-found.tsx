'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalNotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/ru');
    }, 1500); // Дадим пользователю чуть больше времени увидеть 404
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <html lang="ru">
    <body style={styles.body}>
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <div style={styles.divider}></div>
      <p style={styles.text}>Страница не найдена</p>
      <div style={styles.loaderContainer}>
        <div style={styles.loaderBar}></div>
      </div>
    </div>
    </body>
    </html>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  body: {
    margin: 0,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'oklch(1 0 0)', // Светлая тема по умолчанию
    color: 'oklch(0.145 0 0)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    // Поддержка темной темы через медиа-запрос была бы сложной в inline,
    // поэтому используем стандартные системные цвета для надежности
  },
  container: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'fadeIn 0.8s ease-out forwards',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.05em',
  },
  divider: {
    height: '1px',
    width: '40px',
    backgroundColor: 'oklch(0.922 0 0)',
    margin: '1.5rem 0',
  },
  text: {
    fontSize: '0.875rem',
    color: 'oklch(0.556 0 0)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    margin: 0,
  },
  loaderContainer: {
    marginTop: '2rem',
    width: '100px',
    height: '2px',
    backgroundColor: 'oklch(0.922 0 0)',
    position: 'relative',
    overflow: 'hidden',
  },
  loaderBar: {
    position: 'absolute',
    width: '40%',
    height: '100%',
    backgroundColor: 'oklch(0.205 0 0)',
    animation: 'loading 1.5s infinite ease-in-out',
  }
};

// Добавляем анимации прямо в документ через тег style
if (typeof typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); filter: blur(5px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    @keyframes loading {
      0% { left: -40%; }
      100% { left: 100%; }
    }
    @media (prefers-color-scheme: dark) {
      body { background-color: oklch(0.145 0 0) !important; color: oklch(0.985 0 0) !important; }
      div[style*="backgroundColor: oklch(0.922 0 0)"] { background-color: oklch(1 0 0 / 10%) !important; }
      div[style*="backgroundColor: oklch(0.205 0 0)"] { background-color: oklch(0.922 0 0) !important; }
    }
  `;
  document.head.appendChild(styleSheet);
}