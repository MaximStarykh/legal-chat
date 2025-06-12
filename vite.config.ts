import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Environment variables to expose to the client
  const envVars = {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.REACT_APP_GEMINI_API_KEY),
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.REACT_APP_GEMINI_API_KEY),
  };

  // Base configuration
  const config = {
    plugins: [
      react(),
    ],
    define: envVars,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    css: {
      postcss: './postcss.config.cjs',
    },
    server: {
      port: 5173,
      open: true,
      hmr: {
        overlay: false, // Disable HMR overlay to prevent error popups
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      // Remove the minify option to use the default behavior
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  };

  return config;
});
