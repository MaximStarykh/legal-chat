import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Determine the API URL based on the environment
  const apiUrl = env.VITE_API_URL || 'http://localhost:3001';
  const isProduction = mode === 'production';
  const base = isProduction ? '/' : '/';

  return {
    base,
    plugins: [
      react(),
    ],
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
        ],
      },
      devSourcemap: !isProduction,
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    
    // Environment variables that should be exposed to the client
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    
    // Server configuration
    server: {
      port: 3000,
      strictPort: true,
      open: !process.env.CI,
      proxy: !isProduction ? {
        // Proxy API requests in development to avoid CORS issues
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          ws: true,
          // Don't rewrite the /api prefix
          rewrite: (path) => path,
          // Configure CORS headers for development
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.error('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Proxying request to backend:', req.method, req.url);
              console.log('Request headers:', JSON.stringify(req.headers, null, 2));
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Response from backend:', proxyRes.statusCode, req.url);
            });
          }
        },
      } : undefined,
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      cssMinify: isProduction,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
        },
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['@google/generative-ai', 'axios'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
        },
      },
      commonjsOptions: {
        include: /node_modules/,
      },
    },
    
    // Preview configuration
    preview: {
      port: 3000,
      strictPort: true,
      open: !process.env.CI,
    },
    
    // Resolve configuration
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@google/generative-ai',
        'axios',
      ],
      exclude: ['@google/generative-ai'],
      esbuildOptions: {
        // Enable esbuild's tree shaking
        treeShaking: true,
      },
    },
  };
});
