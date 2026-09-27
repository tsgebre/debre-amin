// @ts-check
import { defineConfig } from 'astro/config';
import { resolveDeployEnv } from './src/config/deploy.ts';

const { site, base } = resolveDeployEnv(process.env);

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
});
