import axios from "./axios";

export const loginRequest = (password) => {
  console.log("Sending login request with password:", password);
  return axios.post("/api/login", { password }).then(res => {
    console.log("Login response:", res.data);
    return res;
  }).catch(err => {
    console.error("Login error response:", err.response?.data);
    throw err;
  });
};
