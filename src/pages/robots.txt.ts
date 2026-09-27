import type { APIContext } from 'astro';
import { absoluteUrl, assetPath } from '../i18n/paths';
import { DEFAULT_SITE } from '../config/deploy';

/** Pure builder, so the endpoint's output is testable without an HTTP round trip. */
export function buildRobotsTxt(site: string, base: string): string {
  const sitemapUrl = absoluteUrl(assetPath('sitemap-index.xml', base), site);
  return `User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n`;
}

export function GET({ site }: APIContext) {
  const base = import.meta.env.BASE_URL;
  const body = buildRobotsTxt(site?.href ?? DEFAULT_SITE, base);
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
