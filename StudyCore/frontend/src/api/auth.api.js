import axios from "./axios";

export const loginRequest = (password) => {
  // Trim password to remove any whitespace
  const trimmedPassword = password.trim();
  console.log("Sending login request with password:", trimmedPassword);
  console.log("API Base URL:", axios.defaults.baseURL);
  
  return axios.post("/api/login", { password: trimmedPassword }).then(res => {
    console.log("Login response:", res.data);
    return res;
  }).catch(err => {
    console.error("Login error response:", err.response?.data);
    console.error("Full error:", err);
    throw err;
  });
};
