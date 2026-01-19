import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import compression from 'vite-plugin-compression'

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/$/, '')

const getRuntimeApiTarget = () => {
  try {
    const runtimePath = path.resolve(process.cwd(), 'public', 'runtime-config.js')
    if (!fs.existsSync(runtimePath)) return ''
    const content = fs.readFileSync(runtimePath, 'utf8')

    // Matches: VITE_API_GATEWAY_URL: "https://..."
    const match = content.match(/VITE_API_GATEWAY_URL\s*:\s*['\"]([^'\"]+)['\"]/)
    return match ? normalizeBaseUrl(match[1]) : ''
  } catch {
    return ''
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = normalizeBaseUrl(env.VITE_API_GATEWAY_URL) || getRuntimeApiTarget();

  const normalizeId = (id) => String(id || '').replace(/\\/g, '/')

  return {
    resolve: {
      // Avoid duplicate React copies (can cause invalid hook calls after OAuth redirects)
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      // Add buffer polyfills for AWS Amplify compatibility
      alias: {
        buffer: 'buffer',
        process: 'process/browser',
        // Resolve `process/browser` to an ESM shim to avoid CommonJS `module` usage
        'process/browser': path.resolve(process.cwd(), 'src', 'shims', 'process-shim.js'),
        // Ensure the browser-friendly, ESM-compatible sha256 implementation is used
        '@aws-crypto/sha256-js': '@aws-crypto/sha256-browser',
      },
    },
    define: {
      global: 'globalThis',
      module: { exports: {} },
    },
    plugins: [
      react(),
      // Only enable PWA in production builds
      ...(mode === 'production' ? [VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          maximumFileSizeToCacheInBytes: 2 * 1024 * 1024, // Reduced to 2 MB
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Removed heavy assets
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50, // Reduced from 100
                  maxAgeSeconds: 60 * 60 * 24 * 7, // Reduced to 7 days
                },
              },
            },
          ],
        },
      })] : []),
      // Only enable compression in production
      ...(mode === 'production' ? [
        compression({
          algorithm: 'gzip',
          ext: '.gz',
        }),
        compression({
          algorithm: 'brotliCompress',
          ext: '.br',
        })
      ] : []),
      (env.VITE_ANALYZE === 'true' || process.env.ANALYZE === 'true') ? visualizer({ filename: 'dist/bundle-stats.html', open: false }) : undefined,
    ].filter(Boolean),
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = normalizeId(id)

            if (!normalizedId.includes('node_modules')) return;

            // Route-based code splitting for pages
            if (normalizedId.includes('/pages/')) {
              const pageName = normalizedId.split('/pages/')[1]?.split('.')[0] || 'page'
              return `page-${pageName}`
            }

            // Vendor library splitting
            if (normalizedId.includes('react-router')) return 'vendor-router';
            if (normalizedId.includes('react-toastify')) return 'vendor-toast';
            if (normalizedId.includes('leaflet') || normalizedId.includes('react-leaflet')) return 'vendor-maps';
            if (normalizedId.includes('@stripe') || normalizedId.includes('stripe')) return 'vendor-stripe';
            if (normalizedId.includes('amazon-cognito-identity-js')) return 'vendor-auth';
            if (normalizedId.includes('i18next') || normalizedId.includes('react-i18next')) return 'vendor-i18n';
            if (normalizedId.includes('lucide-react')) return 'vendor-icons';
            if (normalizedId.includes('react-lazy-load-image-component')) return 'vendor-lazy-images';
            if (normalizedId.includes('@tanstack/react-virtual')) return 'vendor-virtual';
            if (normalizedId.includes('axios')) return 'vendor-http';

            return 'vendor-core';
          },
        },
      },
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      // Disable source maps in production for faster builds
      sourcemap: mode === 'development',
      // Minify for better performance
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
          // Additional compression options
          passes: 2,
          unsafe: true,
          unsafe_comps: true,
          unsafe_Function: true,
          unsafe_math: true,
          unsafe_symbols: true,
          unsafe_methods: true,
          unsafe_proto: true,
          unsafe_regexp: true,
          unsafe_undefined: true,
        },
        mangle: {
          safari10: true,
          // Additional mangling options
          properties: {
            regex: /^_[A-Za-z]/,
          },
        },
        format: {
          comments: false,
        },
      },
      // Optimize CSS
      cssCodeSplit: true,
      // Optimize assets - inline smaller assets, compress larger ones
      assetsInlineLimit: 4096,
      // Report compressed size for better monitoring
      reportCompressedSize: false,
      // Preload modules for better performance
      modulePreload: {
        polyfill: false,
      },
      // Target modern browsers for smaller bundle size
      target: 'esnext',
      // Optimize dependencies
      commonjsOptions: {
        include: [/node_modules/],
      },
    },
    // Add polyfills for Node.js modules used by AWS Amplify
    // Optimize dependencies for faster startup
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'lucide-react',
        'react-i18next',
        'react-helmet-async',
        'react-toastify',
        // 'buffer',
        'process',
        '@aws-crypto/sha256-browser',
        // Ensure commonjs browser shims are pre-bundled to ESM
        'debug',
        'react-devtools-core',
      ],
      exclude: [
        '@vite/client',
        '@vite/env',
        // Exclude heavy libraries from pre-bundling
        '@stripe/react-stripe-js',
        '@stripe/stripe-js',
        'leaflet',
        'react-leaflet',
        'amazon-cognito-identity-js',
        '@tanstack/react-virtual',
        'react-lazy-load-image-component',
        // Exclude Node.js polyfills (left empty so `buffer`/`process` can be optimized)
      ],
      // Force include critical dependencies
      force: true,
    },
    // Add preload hints for critical resources
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { runtime: `window.__vitePreload("${filename}")` };
        }
        return filename;
      },
    },
    server: {
      port: 5175,
      strictPort: true,
      host: true, // Allow access from network
      // Speed up HMR
      hmr: {
        overlay: false, // Disable error overlay for faster startup
      },
      // Enable fs strict mode for better performance
      fs: {
        strict: true,
      },
      // Optimize development performance
      watch: {
        usePolling: false, // Use native file watching for better performance
      },
      proxy: apiTarget
        ? {
            '/api': {
              target: apiTarget === '/api' ? 'https://ttfcw5hak8.execute-api.us-east-1.amazonaws.com/prod' : apiTarget,
              changeOrigin: true,
              secure: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
              // Add timeout and retry logic
              timeout: 30000,
              proxyTimeout: 30000,
            },
          }
        : undefined,
    },
  };
});
