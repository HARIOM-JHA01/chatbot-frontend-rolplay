import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        allowedHosts: ["dev.aux-rolplay.com"],
        //     host: "0.0.0.0",
        //     port: 5173,
        //     proxy: {
        //         "/api": {
        //             target: "http://159.65.219.34:11434", // Ollama backend
        //             changeOrigin: true,
        //             rewrite: (path) => path.replace(/^\/api/, ""),
        //         },
        //     },
    },
});
