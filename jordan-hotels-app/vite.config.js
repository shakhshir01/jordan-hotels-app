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

  const normalizeId = (id) => String(id || '').replace(/\\/g, '/')

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = normalizeId(id)

            if (!normalizedId.includes('node_modules')) return;

            if (normalizedId.includes('react-router')) return 'vendor-router';
            if (normalizedId.includes('react-toastify')) return 'vendor-toast';
            if (normalizedId.includes('leaflet') || normalizedId.includes('react-leaflet')) return 'vendor-maps';
            if (normalizedId.includes('@stripe') || normalizedId.includes('stripe')) return 'vendor-stripe';
            if (normalizedId.includes('amazon-cognito-identity-js')) return 'vendor-auth';
            if (normalizedId.includes('i18next') || normalizedId.includes('react-i18next')) return 'vendor-i18n';
            if (normalizedId.includes('lucide-react')) return 'vendor-icons';

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
