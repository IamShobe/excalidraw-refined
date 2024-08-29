import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";


const server = {
  target: "http://localhost:8080",
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.IS_PREACT": JSON.stringify("true"),
  },
  server: {
    proxy: {
      "/api": server,
      "/docs": server,
      "/openapi.json": server,
    },
  },
});
