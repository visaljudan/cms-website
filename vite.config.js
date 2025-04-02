import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import envCompatible from "vite-plugin-env-compatible";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), envCompatible()],
  optimizeDeps: {
    include: ["quill-image-resize"],
  },
  resolve: {
    alias: {
      quill: "quill/dist/quill.js",
    },
  },
  server: {
    allowedHosts: ["https://cms-website-l9rw.onrender.com"],
  },
});
