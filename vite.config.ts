import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env keys (including API_BASE_URL without VITE_ prefix)
  const fileEnv = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Expose env keys to the client exactly as defined in .env
    define: {
      "import.meta.env.API_BASE_URL": JSON.stringify(fileEnv.API_BASE_URL ?? ""),
      "import.meta.env.IMAGE_BASE_URL": JSON.stringify(fileEnv.IMAGE_BASE_URL ?? ""),
    },
    server: {
      port: 3003,
      // Allow reverse-proxy / tunnel hosts (e.g. fahim5004.naimulhassan.me)
      allowedHosts: [".naimulhassan.me", "localhost", "127.0.0.1"],
    },
    preview: {
      port: 3003,
      allowedHosts: [".naimulhassan.me", "localhost", "127.0.0.1"],
    },
  };
});
