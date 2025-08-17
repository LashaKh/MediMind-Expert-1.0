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
    // Performance optimizations
    cssCodeSplit: true,
    reportCompressedSize: false, // Faster builds
    rollupOptions: {
      external: [],
      output: {
        compact: true,
        format: 'es',
        hoistTransitiveImports: false,
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        },
        manualChunks(id) {
          // Simplified chunking to prevent React context issues
          if (id.includes('node_modules')) {
            // Keep ALL UI and React libraries together to prevent context issues
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || 
                id.includes('react-hook-form') || id.includes('react-i18next') || id.includes('react-hot-toast') ||
                id.includes('react-hotkeys-hook') || id.includes('react-markdown') || id.includes('react-syntax-highlighter') ||
                id.includes('lucide-react') || id.includes('framer-motion') || id.includes('clsx') ||
                id.includes('@headlessui/react') || id.includes('@heroicons/react') || id.includes('@radix-ui') ||
                id.includes('class-variance-authority') || id.includes('tailwind-merge') || id.includes('tailwindcss-animate') ||
                id.includes('zustand') || id.includes('@hookform/resolvers') || id.includes('zod') ||
                id.includes('html2canvas') || id.includes('date-fns') || id.includes('recharts') ||
                id.includes('unist-util-visit') || id.includes('remark-gfm') || id.includes('dompurify') ||
                id.includes('@supabase/supabase-js')) {
              return 'vendor-react';
            }
            if (id.includes('marked')) {
              return 'vendor-markdown';
            }
            if (id.includes('i18next')) {
              return 'vendor-i18n';
            }
            if (id.includes('axios') || id.includes('node-fetch') || id.includes('form-data')) {
              return 'vendor-network';
            }
            if (id.includes('jspdf') || id.includes('pdfjs-dist') || id.includes('tesseract.js')) {
              return 'vendor-pdf';
            }
            return 'vendor-misc';
          }
          
          // Calculator components - split by medical specialty
          if (id.includes('src/components/Calculators/')) {
            // Cardiology calculators
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
            
            // OB/GYN calculators
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
            
            // Calculator main component and shared utilities
            if (id.includes('Calculators.tsx') || id.includes('calculator-ui')) {
              return 'calculators-main';
            }
          }
          
          // Context providers
          if (id.includes('src/contexts/')) {
            return 'contexts';
          }
          
          // Translation files
          if (id.includes('src/i18n/')) {
            return 'translations';
          }
          
          // Other components
          if (id.includes('src/components/')) {
            if (id.includes('AICopilot/')) {
              return 'ai-copilot';
            }
            if (id.includes('KnowledgeBase/')) {
              return 'knowledge-base';
            }
            if (id.includes('PodcastStudio/')) {
              return 'podcast-studio';
            }
            return 'components';
          }
          
          // Utilities and services
          if (id.includes('src/lib/') || id.includes('src/utils/') || id.includes('src/services/')) {
            return 'utils';
          }
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
          // Organize chunks by type for better caching
          if (chunkInfo.name.includes('calculators')) {
            return `assets/calculators/[name].[hash].js`;
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