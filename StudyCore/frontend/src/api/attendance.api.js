import API from "./axios";

export const getAttendance = async (days = 14) => {
  try {
    const response = await API.get("/api/attendance", { params: { days } });
    return response;
  } catch (err) {
    throw err.response ? err.response.data : { error: "Ошибка сервера" };
  }
};
