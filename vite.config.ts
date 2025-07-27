import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(() => {
  // Use base path only for web builds, not for Electron (dev or production)
  const isElectronDev = process.env.ELECTRON_DEV === "true";
  const isElectronBuild = process.env.ELECTRON_BUILD === "true";
  const base = (isElectronDev || isElectronBuild) ? "./" : "/FetchZ/";
  
  return {
    base,
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
              src: `${base}fetchz_512x512.png`,
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
  };
});
