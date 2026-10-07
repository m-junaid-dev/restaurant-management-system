import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages ke liye: VITE_BASE=/repository-name/ (.env mein set karein)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    base: mode === "production" ? env.VITE_BASE || "/restaurant-management-system/" : "/",
  };
});
