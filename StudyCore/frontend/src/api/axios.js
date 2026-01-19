import axios from "axios";

// Automatically detect the correct base URL for production and development
const baseURL = import.meta.env.MODE === 'production' 
  ? window.location.origin  // Use same origin in production (Render deployment)
  : "http://localhost:5000";  // Use local backend in development

export default axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});
