import api from "./axiosInstance";

// Типы для ответов (опционально, но полезно)
export interface TelegramStatus {
  isLinked: boolean;
  chatId?: string;
  groupName?: string;
  linkedAt?: string;
  enabled?: boolean;
}

export interface TelegramTokenResponse {
  token: string;
  expiresAt: string;
}

export const integrationService = {
  /**
   * Генерирует одноразовый токен для привязки бота
   * Используется для генерации ссылки типа t.me/bot?start=TOKEN
   */
  generateTelegramToken() {
    return api.post<TelegramTokenResponse>("/integration/telegram/token");
  },

  /**
   * Привязывает группу к компании
   * @param data - объект с временным токеном и ID чата Telegram
   */
  bindTelegram(data: { token: string; chatId: string }) {
    return api.post<{ success: boolean }>("/integration/telegram/bind", data);
  },

  /**
   * Проверяет, подключен ли Telegram и к какому чату
   */
  getTelegramStatus() {
    return api.get<TelegramStatus>("/integration/telegram/status");
  },

  /**
   * Удаляет интеграцию с Telegram для текущей компании
   */
  unbindTelegram() {
    return api.post<{ success: boolean }>("/integration/telegram/unbind");
  },
};