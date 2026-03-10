import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ command }) => ({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    command === 'serve' ? basicSsl() : null
  ].filter(Boolean),
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().split('T')[0]),
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
}));
