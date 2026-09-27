import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { placeholderFields, siteConfig } from '../src/data/site';

const ROOT = resolve(__dirname, '..');
const README = readFileSync(resolve(ROOT, 'README.md'), 'utf-8');
const PACKAGE_JSON = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'));

// The headings the Architect's task requires verbatim, so the README stays
// navigable and every required topic is genuinely covered.
const REQUIRED_HEADINGS = [
  '## Quick start',
  '## Replacing placeholder content',
  '### Placeholder checklist',
  '## Adding an announcement or event',
  '## Adding a photo to the gallery',
  '## Adding clergy photos',
  '## Deploying to GitHub Pages',
  '## What still needs parish review',
  '## Maintenance',
  '## Troubleshooting',
  '## Known limitations',
  '## Future work',
];

describe('README required headings', () => {
  it.each(REQUIRED_HEADINGS)('has the heading %j', (heading) => {
    expect(README.split('\n')).toContain(heading);
  });
});

describe('README placeholder checklist', () => {
  const normalized = [
    ...new Set(
      placeholderFields(siteConfig).map((f) => f.replace(/\.\d+(?=\.|$)/g, '.N')),
    ),
  ];

  it('found at least one placeholder field to check (sanity check on the fixture itself)', () => {
    expect(normalized.length).toBeGreaterThan(0);
  });

  it.each(normalized)('lists `%s` in the Placeholder checklist', (path) => {
    expect(README).toContain(`\`${path}\``);
  });
});

describe('README review-list cross-references', () => {
  const exportNames = [
    'AM_NEEDS_REVIEW',
    'CONFIG_AM_NEEDS_REVIEW',
    'ECAL_AM_NEEDS_REVIEW',
    'GALLERY_AM_NEEDS_REVIEW',
  ];

  it.each(exportNames)('mentions %s', (name) => {
    expect(README).toContain(name);
  });
});

describe('README npm scripts', () => {
  const mentioned = [...new Set([...README.matchAll(/npm run ([a-zA-Z0-9:_-]+)/g)].map((m) => m[1]))];

  it('mentions at least one script (sanity check on the fixture itself)', () => {
    expect(mentioned.length).toBeGreaterThan(0);
  });

  it.each(mentioned)('`npm run %s` exists in package.json', (script) => {
    expect(PACKAGE_JSON.scripts).toHaveProperty(script);
  });
});

describe('README file references', () => {
  const paths = [
    ...new Set(
      [...README.matchAll(/`((?:src|public|docs|scripts|\.github)\/[^`]*)`/g)].map((m) => m[1]),
    ),
  ];

  it('found at least one referenced path (sanity check on the fixture itself)', () => {
    expect(paths.length).toBeGreaterThan(0);
  });

  it.each(paths)('%s exists on disk', (path) => {
    expect(existsSync(resolve(ROOT, path)), path).toBe(true);
  });
});

describe('README contains no invented real-world domain', () => {
  // Curated TLD list, not a general hostname regex: a broad regex also
  // matches things like "Node.js" or "site.ts", which are not domains.
  const DOMAIN = /\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.(org|com|net|io|edu|gov|us)\b/gi;
  const ALLOWED = /^([a-z0-9-]+\.)*(example\.(org|com)|(?:[a-z0-9-]+\.)?github\.io)$/i;

  const found = [...new Set([...README.matchAll(DOMAIN)].map((m) => m[0]))];

  it('found at least one domain-shaped string (sanity check on the fixture itself, and on the regex)', () => {
    expect(found.length).toBeGreaterThan(0);
  });

  it.each(found)('%s is an example.* / github.io illustration', (domain) => {
    expect(domain).toMatch(ALLOWED);
  });
});
