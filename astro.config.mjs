import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://mbsdoc.com',
  trailingSlash: 'always',
  integrations: [react()],
});
