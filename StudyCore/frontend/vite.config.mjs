import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../backend/frontend/dist", // билд попадёт в backend
    emptyOutDir: true
  }
});
