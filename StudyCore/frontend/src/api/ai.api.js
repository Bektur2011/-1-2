import axios from "./axios";

/**
 * Отправить сообщение AI помощнику
 * @param {string} message - Сообщение пользователя
 * @param {Array} history - История чата
 * @returns {Promise} - Ответ от AI
 */
export const sendMessageToAI = async (message, history = []) => {
  return axios.post("/api/ai/chat", {
    message,
    history
  });
};

/**
 * Проверить статус AI сервиса
 * @returns {Promise} - Статус доступности
 */
export const getAIStatus = async () => {
  return axios.get("/api/ai/status");
};
