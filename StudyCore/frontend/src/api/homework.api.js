import axios from "./axios";

export const getHomework = () => axios.get("/api/homework");

export const addHomework = (title, description, image_url) =>
  axios.post("/api/homework", { title, description, image_url });

export const deleteHomework = (id) =>
  axios.delete(`/api/homework/${id}`);
