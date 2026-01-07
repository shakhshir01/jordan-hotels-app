import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

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

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('react-toastify')) return 'vendor-toast';
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-maps';
            if (id.includes('@stripe') || id.includes('stripe')) return 'vendor-stripe';
            if (id.includes('amazon-cognito-identity-js')) return 'vendor-auth';
            if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react')) return 'vendor-react';

            return 'vendor';
          },
        },
      },
    },
    server: {
      port: 5175,
      strictPort: false,
      proxy: apiTarget
        ? {
            '/api': {
              target: apiTarget,
              changeOrigin: true,
              secure: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
            },
          }
        : undefined,
    },
  };
});
