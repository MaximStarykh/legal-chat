import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envVars = {
    "process.env.NODE_ENV": JSON.stringify(mode),
  };

  // Base configuration
  const config = {
    plugins: [react()],
    define: envVars,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    css: {
      postcss: "./postcss.config.cjs",
    },
    server: {
      port: 5173,
      open: true,
      hmr: {
        overlay: false, // Disable HMR overlay to prevent error popups
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: mode !== "production",
      // Remove the minify option to use the default behavior
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
  };

  return config;
});
