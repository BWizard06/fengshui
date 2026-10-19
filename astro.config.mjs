import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { defaultLocale, locales } from './src/i18n/config.ts';

export default defineConfig({
  site: 'https://katischepis.ch',
  trailingSlash: 'never',
  adapter: cloudflare({
    imageService: { build: 'compile', runtime: 'passthrough' },
    prerenderEnvironment: 'node',
  }),
  image: {
    layout: 'constrained',
    responsiveStyles: false,
  },
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      MAILCHIMP_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  i18n: {
    locales: [...locales],
    defaultLocale,
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
