import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
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
        'react-i18next',
        'framer-motion',
        'lucide-react'
      ]
    },
  server: {
    hmr: {
      overlay: false
    },
    host: '0.0.0.0',
    // Fix PDF.js worker serving in development
    fs: {
      allow: ['..']
    },
    // Add headers for PDF worker and cache control
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
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
      external: [],
      output: {
        compact: true,
        format: 'es',
        hoistTransitiveImports: false,
        // CRITICAL FIX: Remove globals config that causes React externalization conflict
        // globals: {
        //   'react': 'React',
        //   'react-dom': 'ReactDOM'
        // },
        manualChunks(id) {
          // Mobile Performance Optimization: Enhanced chunking strategy
          if (id.includes('node_modules')) {
            // Heavy libraries that are now dynamically loaded - separate chunks
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf-export';
            }
            if (id.includes('tesseract.js') || id.includes('pdfjs-dist')) {
              return 'vendor-ocr';
            }
            if (id.includes('marked')) {
              return 'vendor-markdown';
            }
            
            // CRITICAL: Core React libraries MUST stay in main bundle to prevent SECRET_INTERNALS error
            if (id.includes('react/') || id.includes('react-dom/') || 
                id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') ||
                id.includes('react-router') || id.includes('@headlessui') || 
                id.includes('@heroicons') || id.includes('framer-motion')) {
              return undefined; // Main bundle - prevents module loading race conditions
            }
            
            // i18n - separate for language-specific loading (keep this optimization)
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            
            // Database - can remain separate as it loads after auth
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'vendor-database';
            }
            
            // Form libraries - used primarily in calculators
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            
            // Everything else goes into general vendor chunk
            return 'vendor-core';
          }
          
          // Keep navigation components in main bundle for instant loading
          // Only heavy libraries remain as separate chunks
          
          // Calculator components - only keep specialty-specific ones separate
          if (id.includes('src/components/Calculators/')) {
            // Cardiology calculators - keep these separate as they're specialty-specific
            if (
              id.includes('ASCVDCalculator') ||
              id.includes('AtrialFibrillationCalculators') ||
              id.includes('TIMIRiskCalculator') ||
              id.includes('GRACERiskCalculator') ||
              id.includes('DAPTCalculator') ||
              id.includes('PRECISEDAPTCalculator') ||
              id.includes('PREVENTCalculator')
            ) {
              return 'calculators-cardiology-1';
            }
            if (
              id.includes('HeartFailureStaging') ||
              id.includes('GWTGHFCalculator') ||
              id.includes('MAGGICCalculator') ||
              id.includes('SHFMCalculator') ||
              id.includes('STSCalculator') ||
              id.includes('EuroSCOREIICalculator')
            ) {
              return 'calculators-cardiology-2';
            }
            if (
              id.includes('HCMRiskSCDCalculator') ||
              id.includes('HCMAFRiskCalculator') ||
              id.includes('HIT4TsCalculator') ||
              id.includes('SIADHCalculator')
            ) {
              return 'calculators-cardiology-3';
            }
            
            // OB/GYN calculators - keep these separate as they're specialty-specific
            if (
              id.includes('EDDCalculator') ||
              id.includes('GestationalAgeCalculator') ||
              id.includes('PreeclampsiaRiskCalculator') ||
              id.includes('PretermBirthRiskCalculator') ||
              id.includes('GDMScreeningCalculator')
            ) {
              return 'calculators-obgyn-1';
            }
            if (
              id.includes('BishopScoreCalculator') ||
              id.includes('VBACSuccessCalculator') ||
              id.includes('ApgarScoreCalculator') ||
              id.includes('PPHRiskCalculator')
            ) {
              return 'calculators-obgyn-2';
            }
            if (
              id.includes('CervicalCancerRiskCalculator') ||
              id.includes('OvarianCancerRiskCalculator') ||
              id.includes('EndometrialCancerRiskCalculator') ||
              id.includes('OvarianReserveCalculator') ||
              id.includes('MenopauseAssessmentCalculator')
            ) {
              return 'calculators-obgyn-3';
            }
            
            // Calculator main component and shared utilities - put in main bundle
            return undefined;
          }
          
          // Translation files - split by language for better caching
          if (id.includes('src/i18n/')) {
            if (id.includes('/en/')) return 'translations-en';
            if (id.includes('/ka/')) return 'translations-ka';  
            if (id.includes('/ru/')) return 'translations-ru';
            // Core i18n files (config, loader)
            return 'translations-core';
          }
          
          // EVERYTHING ELSE goes to main bundle (index.js) - no separate chunks
          return undefined;
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
          // Mobile Performance Optimization: Enhanced chunk organization
          if (chunkInfo.name.includes('calculators')) {
            return `assets/calculators/[name].[hash].js`;
          }
          if (chunkInfo.name.includes('translations')) {
            return `assets/i18n/[name].[hash].js`;
          }
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