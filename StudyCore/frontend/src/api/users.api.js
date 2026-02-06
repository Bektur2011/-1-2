import API from "./axios";

// Получить всех пользователей (можно с лимитом)
export const getUsers = async (limit) => {
  try {
    const response = await API.get("/api/users", limit ? { params: { limit } } : undefined);
    return response;
  } catch (err) {
    throw err.response ? err.response.data : { error: "Ошибка сервера" };
  }
};

// Получить пользователя по ID
export const getUserById = async (id) => {
  try {
    const response = await API.get(`/api/users/${id}`);
    return response;
  } catch (err) {
    throw err.response ? err.response.data : { error: "Ошибка сервера" };
  }
};

// Обновить роль пользователя
export const updateUserRole = async (id, role) => {
  try {
    const response = await API.put(`/api/users/${id}/role`, { role });
    return response;
  } catch (err) {
    throw err.response ? err.response.data : { error: "Ошибка сервера" };
  }
};
