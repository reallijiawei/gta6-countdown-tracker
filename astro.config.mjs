import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://gta6countdown.example.com',
  integrations: [tailwind()],
});
