// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { resolveDeployEnv } from './src/config/deploy.ts';

const { site, base } = resolveDeployEnv(process.env);

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', am: 'am' },
      },
      // The root redirect (noindex) and the 404 have nothing to index. Strip
      // `base` first, since it can be '/', so pathname alone isn't enough.
      filter: (page) => {
        const path = new URL(page).pathname;
        const rest = path.startsWith(base) ? path.slice(base.length) : path;
        const [first] = rest.split('/').filter(Boolean);
        return first !== undefined && !first.startsWith('404');
      },
    }),
  ],
});
