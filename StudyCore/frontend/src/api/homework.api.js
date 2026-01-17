import axios from "./axios";

export const getHomework = () => axios.get("/api/homework");

export const addHomework = (title, description) =>
  axios.post("/api/homework", { title, description });

export const deleteHomework = (id) =>
  axios.delete(`/api/homework/${id}`);
