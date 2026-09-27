import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import LangIndex from '../src/pages/[lang]/index.astro';
import RootRedirect from '../src/pages/index.astro';
import Placeholder from '../src/components/Placeholder.astro';
import { LOCALES, type Locale } from '../src/i18n/index';
import { NAV } from '../src/i18n/nav';

type Component = Parameters<AstroContainer['renderToString']>[0];
// getStaticPaths pages without Props are typed `(props: never)`, which the container signature rejects.
const LangIndexPage = LangIndex as unknown as Component;

let container: AstroContainer;
const html: Partial<Record<Locale, string>> = {};

beforeAll(async () => {
  container = await AstroContainer.create();
  for (const lang of LOCALES) {
    html[lang] = await container.renderToString(LangIndexPage, {
      params: { lang },
      request: new Request(`http://localhost/${lang}/`),
    });
  }
});

function anchors(doc: string): { attrs: string; text: string }[] {
  return [...doc.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
    attrs: m[1],
    text: m[2].trim(),
  }));
}

function attr(attrs: string, name: string): string | undefined {
  return new RegExp(`\\b${name}="([^"]*)"`).exec(attrs)?.[1];
}

describe.each(LOCALES)('[lang] home page — %s', (lang) => {
  const other: Locale = lang === 'en' ? 'am' : 'en';
  const doc = () => html[lang]!;

  it('sets <html lang>', () => {
    expect(doc()).toMatch(new RegExp(`<html[^>]*\\blang="${lang}"`));
  });

  it('has a skip link to #main as the first link, before <nav>', () => {
    const first = anchors(doc())[0];
    expect(attr(first.attrs, 'href')).toBe('#main');
    expect(first.attrs).toContain('skip-link');
    expect(doc().indexOf('href="#main"')).toBeLessThan(doc().indexOf('<nav'));
    expect(doc()).toMatch(/<main[^>]*\bid="main"/);
  });

  it('language toggle points at the same page in the other locale', () => {
    const toggle = anchors(doc()).find((a) => a.attrs.includes('lang-toggle'))!;
    expect(attr(toggle.attrs, 'href')).toBe(`/${other}/`);
    expect(attr(toggle.attrs, 'hreflang')).toBe(other);
    expect(attr(toggle.attrs, 'aria-label')).toBeUndefined();
    expect(toggle.text).toMatch(/<span class="visually-hidden"[^>]*>[^<]+: <\/span>/);
    expect(toggle.text).toMatch(new RegExp(`<span lang="${other}"[^>]*>[^<]+</span>`));
    expect(toggle.text).toContain(lang === 'en' ? 'አማርኛ' : 'English');
  });

  it('renders all nine nav links with trailing slashes and marks Home current', () => {
    const navHtml = doc().slice(doc().indexOf('<nav'), doc().indexOf('</nav>'));
    const links = anchors(navHtml);
    expect(links.map((l) => attr(l.attrs, 'href'))).toEqual(
      NAV.map((n) => (n.slug ? `/${lang}/${n.slug}/` : `/${lang}/`)),
    );
    for (const l of links) expect(attr(l.attrs, 'href')!.endsWith('/')).toBe(true);
    const current = links.filter((l) => attr(l.attrs, 'aria-current') === 'page');
    expect(current.map((l) => attr(l.attrs, 'href'))).toEqual([`/${lang}/`]);
    expect(navHtml).toMatch(/<nav[^>]*aria-label="[^"]+"/);
  });

  it('the header cross motif SVG is hidden from assistive tech', () => {
    const header = doc().slice(doc().indexOf('<header'), doc().indexOf('</header>'));
    const svg = /<svg\b[^>]*>/.exec(header)![0];
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain('focusable="false"');
  });

  it('has no missing-translation markers', () => {
    expect(doc()).not.toContain('⟦missing:');
  });

  it('ships no client-side script', () => {
    expect(doc()).not.toMatch(/<script\b/);
  });

  it('references no external CDN', () => {
    expect(doc()).not.toMatch(/googleapis|cdn\./i);
  });
});

describe('Placeholder component', () => {
  it('renders the notice badge and marks the content for later replacement', async () => {
    const doc = await container.renderToString(Placeholder, {
      props: { lang: 'en', field: 'address' },
      slots: { default: '123 Example St' },
    });
    expect(doc).toContain('data-placeholder');
    expect(doc).toContain('Placeholder — the parish will replace this');
    expect(doc).toContain('123 Example St');
    expect(doc).toContain('title="Replace in src/data/site.ts: address"');
  });
});

describe('root redirect page', () => {
  it('redirects to /en/ with meta refresh, canonical and a visible link', async () => {
    const doc = await container.renderToString(RootRedirect, {
      request: new Request('http://localhost/'),
    });
    expect(doc).toContain('http-equiv="refresh" content="0; url=/en/"');
    expect(doc).toMatch(/<link rel="canonical" href="[^"]*\/en\/"/);
    expect(doc).toMatch(/<a href="\/en\/"[\s>]/);
    expect(doc).not.toContain('⟦missing:');
  });
});
