import { describe, expect, it } from 'vitest';
import { checkLinks, resolveBase } from '../scripts/check-links.mjs';

describe('resolveBase', () => {
  it('falls back to "/" (normalised to "") when BASE_PATH is unset or empty', () => {
    expect(resolveBase({})).toBe('');
    expect(resolveBase({ BASE_PATH: '' })).toBe('');
  });

  it('normalises a project-page base', () => {
    expect(resolveBase({ BASE_PATH: '/debre-amin' })).toBe('/debre-amin');
    expect(resolveBase({ BASE_PATH: '/debre-amin/' })).toBe('/debre-amin');
    expect(resolveBase({ BASE_PATH: 'debre-amin' })).toBe('/debre-amin');
  });
});

describe('checkLinks', () => {
  // A small fixture "dist": a good link, a broken link, and a broken
  // same-page fragment, plus the files needed to make the good link real.
  function fixture() {
    const pages = {
      '/en/index.html': `<!doctype html><html lang="en"><body>
        <a class="skip-link" href="#main">Skip to main content</a>
        <a href="#nope">Broken same-page fragment</a>
        <a href="/en/about/">Good link to another page</a>
        <a href="/en/about/#sources">Good link with a fragment that exists on the target</a>
        <a href="/en/nowhere/">Broken link to a page that doesn't exist</a>
        <img src="/favicon.svg" alt="">
        <a href="mailto:info@example.org">Excluded scheme</a>
        <a href="https://example.org/">Excluded — external</a>
        <main id="main">content</main>
      </body></html>`,
      '/en/about/index.html': `<!doctype html><html lang="en"><body>
        <main id="main"><h2 id="sources">Sources</h2></main>
      </body></html>`,
    };
    const existingFiles = new Set([...Object.keys(pages), '/favicon.svg']);
    return { pages, existingFiles };
  }

  it('passes a fixture with no broken links', () => {
    const { pages, existingFiles } = fixture();
    // Remove the two intentionally-broken hrefs for the "all good" case.
    const goodHtml = pages['/en/index.html']
      .replace('<a href="#nope">Broken same-page fragment</a>', '')
      .replace('<a href="/en/nowhere/">Broken link to a page that doesn\'t exist</a>', '');
    const goodPages = { ...pages, '/en/index.html': goodHtml };
    expect(checkLinks(goodPages, existingFiles, '')).toEqual([]);
  });

  it('catches a broken link to a page that does not exist', () => {
    const { pages, existingFiles } = fixture();
    const problems = checkLinks(pages, existingFiles, '');
    expect(problems.some((p) => p.includes('/en/nowhere/'))).toBe(true);
  });

  it('catches a broken same-page fragment', () => {
    const { pages, existingFiles } = fixture();
    const problems = checkLinks(pages, existingFiles, '');
    expect(problems.some((p) => p.includes('#nope'))).toBe(true);
  });

  it('accepts a valid same-page fragment and a valid cross-page fragment', () => {
    const { pages, existingFiles } = fixture();
    const problems = checkLinks(pages, existingFiles, '');
    expect(problems.some((p) => p.includes('#main'))).toBe(false);
    expect(problems.some((p) => p.includes('#sources'))).toBe(false);
  });

  it('excludes mailto:, tel: and external links', () => {
    const { pages, existingFiles } = fixture();
    const problems = checkLinks(pages, existingFiles, '');
    expect(problems.some((p) => p.includes('mailto:'))).toBe(false);
    expect(problems.some((p) => p.includes('example.org'))).toBe(false);
  });

  it('resolves a link to an exact file (not just path/index.html)', () => {
    const { pages, existingFiles } = fixture();
    const problems = checkLinks(pages, existingFiles, '');
    expect(problems.some((p) => p.includes('/favicon.svg'))).toBe(false);
  });

  it('requires links to start with the configured base, and strips it before resolving', () => {
    // dist/ is never physically nested under the base folder — only the
    // rendered href/src attributes carry the "/debre-amin" prefix.
    const pages = {
      '/en/index.html': `<a href="/debre-amin/en/about/">ok</a><a href="/en/about/">missing base prefix</a>`,
      '/en/about/index.html': `<p>about</p>`,
    };
    const existingFiles = new Set(Object.keys(pages));
    const problems = checkLinks(pages, existingFiles, '/debre-amin');
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('/en/about/');
    expect(problems[0]).toContain('does not start with the configured base');
  });

  it('returns no problems for an all-good fixture under a base path', () => {
    const pages = {
      '/en/index.html': `<a href="/debre-amin/en/about/">ok</a>`,
      '/en/about/index.html': `<p>about</p>`,
    };
    const existingFiles = new Set(Object.keys(pages));
    expect(checkLinks(pages, existingFiles, '/debre-amin')).toEqual([]);
  });
});
