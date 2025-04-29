import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: [
        '.',              // Permite acessar a raiz
        path.resolve('./static') // Permite acessar static explicitamente
      ]
    }
  }
});