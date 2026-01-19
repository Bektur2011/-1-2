import API from "./axios";

// Получить всех пользователей
export const getUsers = async () => {
  try {
    const response = await API.get("/api/users");
    return response;
  } catch (err) {
    throw err.response ? err.response.data : { error: "Ошибка сервера" };
  }
};
