import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Development configuration without base path for Electron
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "FetchZ",
        short_name: "FetchZ",
        description: "A user-friendly tool for managing API requests locally",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/fetchz_512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
