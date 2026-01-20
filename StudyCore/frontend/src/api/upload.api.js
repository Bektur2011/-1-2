import axios from "./axios";

/**
 * Загружает файл на сервер
 * @param {File} file - Файл для загрузки
 * @returns {Promise} - Промис с URL загруженного файла
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post("/api/upload", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};
