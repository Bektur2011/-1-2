import axios from "./axios";

export const loginRequest = (password) => {
  return axios.post("/login", { password });
};
