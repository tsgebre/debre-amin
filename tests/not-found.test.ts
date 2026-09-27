import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { JSDOM } from 'jsdom';
import { beforeAll, describe, expect, it } from 'vitest';
import NotFoundPage from '../src/pages/404.astro';
import { scriptPolicyViolations } from './helpers/script-policy';

type Component = Parameters<AstroContainer['renderToString']>[0];

let html = '';
let doc: Document;

beforeAll(async () => {
  const container = await AstroContainer.create();
  html = await container.renderToString(NotFoundPage as unknown as Component, {
    request: new Request('http://localhost/no/such/page/'),
  });
  doc = new JSDOM(html).window.document;
});

describe('404 page', () => {
  it('is an English document with a parallel Amharic block', () => {
    expect(doc.documentElement.getAttribute('lang')).toBe('en');
    expect(doc.querySelector('h1')!.textContent).toBe('Page not found');
    const am = doc.querySelector('main section[lang="am"]')!;
    expect(am.querySelector('h2')!.textContent).toBe('ገጹ አልተገኘም');
  });

  it('links to both home pages', () => {
    const hrefs = [...doc.querySelectorAll('main a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/en/', '/am/']);
    expect(doc.querySelector('main a[href="/am/"]')!.getAttribute('hreflang')).toBe('am');
  });

  it('keeps the site header and nav but has no language toggle', () => {
    expect(doc.querySelector('header nav[aria-label]')).not.toBeNull();
    expect(doc.querySelector('.lang-toggle')).toBeNull();
  });

  it('has no missing-translation markers and ships only local scripts', () => {
    expect(html).not.toContain('⟦missing:');
    expect(scriptPolicyViolations(html)).toEqual([]);
  });
});
