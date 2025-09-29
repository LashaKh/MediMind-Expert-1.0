import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/expert/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-hook-form',
        '@hookform/resolvers/zod',
        'zod',
        'react-i18next',
        'framer-motion',
        'lucide-react'
      ],
      exclude: [
        'pdfjs-dist'
      ]
    },
    server: {
      // Enable HTTPS only when explicitly requested via environment variable
      https: process.env.HTTPS === 'true' ? true : false,
      hmr: {
        overlay: false
      },
      host: '0.0.0.0',
      // Fix PDF.js worker serving in development
      fs: {
        allow: ['..']
      },
      // Add headers for PDF worker, cache control, and permissions policy
      headers: {
        'Cross-Origin-Embedder-Policy': 'credentialless',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Permissions-Policy': 'microphone=*, camera=*, geolocation=*'
      },
      proxy: {
        '/api/brave': {
          target: 'https://api.search.brave.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/brave/, ''),
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip'
          }
        },
        '/api/exa': {
          target: 'https://api.exa.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/exa/, ''),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        },
        '/api/perplexity': {
          target: 'https://api.perplexity.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/perplexity/, ''),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      }
    },
    build: {
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false
        },
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          // Additional optimizations for medical calculators
          dead_code: true,
          unused: true,
          reduce_funcs: true,
          reduce_vars: true
        },
        mangle: {
          // Preserve function names for medical calculator debugging if needed
          keep_fnames: /^calculate|^validate/
        }
      },
      outDir: 'dist',
      sourcemap: false,
      target: 'esnext',
      chunkSizeWarningLimit: 1000, // Reduced for better performance monitoring
      // Performance optimizations - disable CSS splitting to prevent font flashes
      cssCodeSplit: false,
      reportCompressedSize: false, // Faster builds
      rollupOptions: {
        output: {
          compact: true,
          format: 'es',
          hoistTransitiveImports: false,
          // CRITICAL FIX: Simplified manualChunks that guarantees React stays in main bundle
          manualChunks: {
            // Heavy libraries - separate chunks for lazy loading
            'vendor-pdf': ['jspdf', 'html2canvas'],
            'vendor-ocr': ['tesseract.js', 'pdfjs-dist'],
            'vendor-markdown': ['marked'],
            'vendor-i18n': ['i18next', 'react-i18next'],
            'vendor-database': ['@supabase/supabase-js'],
            'vendor-forms': ['react-hook-form', '@hookform/resolvers/zod', 'zod'],
            // Keep other utilities together
            'vendor-utils': [
              'lodash',
              'date-fns',
              'uuid',
              'classnames',
              'clsx'
            ]
            // IMPORTANT: React, React-DOM, React-Router, Framer-Motion, and other core UI libraries
            // are intentionally NOT listed here, so they remain in the main bundle (index.js)
            // This prevents the SECRET_INTERNALS error by ensuring React's internals are available
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name].[hash][extname]`;
            }
            if (/css/i.test(ext)) {
              return `assets/styles/[name].[hash][extname]`;
            }
            return `assets/[name].[hash][extname]`;
          },
          chunkFileNames: (chunkInfo) => {
            // Clean chunk organization
            if (chunkInfo.name.includes('vendor-pdf') || chunkInfo.name.includes('vendor-ocr')) {
              return `assets/heavy/[name].[hash].js`; // Heavy libraries that are lazy loaded
            }
            if (chunkInfo.name.includes('vendor')) {
              return `assets/vendor/[name].[hash].js`;
            }
            return `assets/chunks/[name].[hash].js`;
          },
          entryFileNames: 'assets/[name].[hash].js'
        }
      }
    },
    define: {
      // Define process.env for compatibility
      'process.env.NODE_ENV': JSON.stringify(mode),
      
      // Override import.meta.env properties using environment variables
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.DEV': mode === 'development',
      'import.meta.env.PROD': mode === 'production',
      
      // Load environment variables from .env file
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_BRAVE_API_KEY': JSON.stringify(env.VITE_BRAVE_API_KEY),
      'import.meta.env.VITE_EXA_API_KEY': JSON.stringify(env.VITE_EXA_API_KEY),
      'import.meta.env.VITE_PERPLEXITY_API_KEY': JSON.stringify(env.VITE_PERPLEXITY_API_KEY),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      
      // Vite internals (keep these for compatibility)
      'global': 'globalThis'
    }
  };
});