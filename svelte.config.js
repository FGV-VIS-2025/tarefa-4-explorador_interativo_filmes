import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-auto';

const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),

    alias: {
      $lib: 'src/lib',
      $routes: 'src/routes'
    }
  }
};

export default config;
