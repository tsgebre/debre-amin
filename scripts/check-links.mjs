#!/usr/bin/env node
// Verifies every internal link and asset reference in the built site
// actually resolves to a file in dist/, and that every #id fragment target
// exists (same-page fragments like the skip link's href="#main", and the
// target id on cross-page fragment links). Plain Node, no dependencies, so
// it can run in CI right after `astro build` with nothing extra to
// install.
//
// Usage:
//   node scripts/check-links.mjs
//   BASE_PATH=/debre-amin node scripts/check-links.mjs
//   npm run check:links

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

// Same fallback as src/config/deploy.ts: actions/configure-pages reports
// base_path as '' for user/org sites and custom domains, which must fall
// back to '/'.
export function resolveBase(env = process.env) {
  const base = env.BASE_PATH || '/';
  const segs = base.split('/').filter(Boolean);
  return segs.length ? `/${segs.join('/')}` : '';
}

function findFiles(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...findFiles(full, base));
    } else {
      out.push('/' + full.slice(base.length + 1).split('\\').join('/'));
    }
  }
  return out;
}

const ATTR_RE = /\b(?:href|src)="([^"]+)"/g;
const ID_RE = /\bid="([^"]+)"/g;

function extractLinks(html) {
  return [...html.matchAll(ATTR_RE)].map((m) => m[1]);
}

function extractIds(html) {
  return new Set([...html.matchAll(ID_RE)].map((m) => m[1]));
}

function isSamePageFragment(href) {
  return href.startsWith('#') && href.length > 1;
}

/** Internal per the task's rule: starts with "/" (which also covers a base-prefixed path); excludes bare fragments, mailto: and tel:, and any other URL scheme. */
function isInternalPathLink(href) {
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  if (href.startsWith('//')) return false; // protocol-relative external
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return false; // any other scheme, e.g. https:
  return href.startsWith('/');
}

/** Resolves a site-relative pathname (post-base-stripping) to a key in `existingFiles` — either the exact file or `path/index.html`. */
function resolveExisting(pathname, existingFiles) {
  const clean = pathname === '' ? '/' : pathname;
  if (existingFiles.has(clean)) return clean;
  const asIndex = clean.replace(/\/?$/, '/') + 'index.html';
  if (existingFiles.has(asIndex)) return asIndex;
  return null;
}

/**
 * Core checker, pure and testable.
 * - `pages`: { "/relative/page.html": htmlContent, ... } — every HTML file, for extracting
 *   links/ids. (Non-HTML files, e.g. images or CSS, don't need entries here.)
 * - `existingFiles`: a Set of every file path that exists in dist (HTML and otherwise),
 *   e.g. "/en/index.html", "/robots.txt", "/images/gallery/placeholder-1.svg".
 * - `base`: the site's base path ('' for root, e.g. "/debre-amin" otherwise).
 * Returns a list of human-readable problem strings; empty means everything resolves.
 */
export function checkLinks(pages, existingFiles, base) {
  const problems = [];

  for (const [sourcePath, html] of Object.entries(pages)) {
    const ownIds = extractIds(html);

    for (const rawHref of extractLinks(html)) {
      if (isSamePageFragment(rawHref)) {
        const id = rawHref.slice(1);
        if (!ownIds.has(id)) {
          problems.push(`${sourcePath}: same-page fragment "${rawHref}" has no matching id="${id}" on this page`);
        }
        continue;
      }

      if (!isInternalPathLink(rawHref)) continue;

      const [beforeHash, hash] = rawHref.split('#');
      if (base && !(beforeHash === base || beforeHash.startsWith(`${base}/`))) {
        problems.push(`${sourcePath}: "${rawHref}" does not start with the configured base "${base}"`);
        continue;
      }
      // `dist/` is never physically nested under the base folder — Astro
      // only prefixes href/src attributes with it, since a GitHub Pages
      // project site serves dist/'s contents already mounted at that
      // sub-path. So the base must be stripped before resolving against
      // the files that actually exist on disk.
      const pathname = base ? beforeHash.slice(base.length) || '/' : beforeHash;

      const resolved = resolveExisting(pathname, existingFiles);
      if (!resolved) {
        problems.push(`${sourcePath}: broken link "${rawHref}" (resolved path "${pathname}" not found in dist)`);
        continue;
      }

      if (hash) {
        const targetHtml = pages[resolved];
        if (targetHtml !== undefined && !extractIds(targetHtml).has(hash)) {
          problems.push(`${sourcePath}: broken fragment "#${hash}" in "${rawHref}" (no id="${hash}" in ${resolved})`);
        }
      }
    }
  }

  return problems;
}

function main() {
  if (!existsSync(DIST)) {
    console.error(`check-links: ${DIST} does not exist — run "npm run build" first.`);
    process.exit(1);
  }

  const base = resolveBase();
  const allFiles = findFiles(DIST);
  const existingFiles = new Set(allFiles);
  const pages = {};
  for (const rel of allFiles) {
    if (rel.endsWith('.html')) {
      pages[rel] = readFileSync(join(DIST, rel), 'utf-8');
    }
  }

  const problems = checkLinks(pages, existingFiles, base);

  if (problems.length > 0) {
    console.error(`check-links: ${problems.length} broken link(s)/fragment(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  console.log(`check-links: OK (${Object.keys(pages).length} pages, ${allFiles.length} files, base "${base || '/'}")`);
}

// Only run when invoked directly (not when imported by the test).
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
