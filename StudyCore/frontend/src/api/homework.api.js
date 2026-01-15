import axios from "./axios";

export const getHomework = () => axios.get("/homework");

export const addHomework = (title, description) =>
  axios.post("/homework", { title, description });
