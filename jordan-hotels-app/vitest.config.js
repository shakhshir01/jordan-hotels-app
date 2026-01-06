import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.join(projectRoot, 'src', 'setupTests.js')],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}']
  }
});
