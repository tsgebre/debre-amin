import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import { scriptPolicyViolations } from './helpers/script-policy';
import GivingPage from '../src/pages/[lang]/giving.astro';
import GivingDetails from '../src/components/GivingDetails.astro';
import { LOCALES, type Locale } from '../src/i18n/index';
import type { SiteConfig } from '../src/data/site';

type Component = Parameters<AstroContainer['renderToString']>[0];
// getStaticPaths pages without Props are typed `(props: never)`, which the container signature rejects.
const GivingPageComponent = GivingPage as unknown as Component;

let container: AstroContainer;
const html: Partial<Record<Locale, string>> = {};

beforeAll(async () => {
  container = await AstroContainer.create();
  for (const lang of LOCALES) {
    html[lang] = await container.renderToString(GivingPageComponent, {
      params: { lang },
      request: new Request(`http://localhost/${lang}/giving/`),
    });
  }
});

function titleFor(field: string): string {
  return `title="Replace in src/data/site.ts: ${field}"`;
}

describe.each(LOCALES)('giving page — %s', (lang) => {
  const doc = () => html[lang]!;

  it('sets <html lang> correctly', () => {
    expect(doc()).toMatch(new RegExp(`<html[^>]*\\blang="${lang}"`));
  });

  it('has exactly one <h1>', () => {
    expect(doc().match(/<h1\b/g)).toHaveLength(1);
  });

  it('has 5 giving method sections, each with an <h2>', () => {
    const main = doc().slice(doc().indexOf('<main'), doc().indexOf('</main>'));
    // Notes is its own <h2>, so 5 method headings + 1 notes heading = 6 total <h2>s.
    expect(main.match(/<h2\b/g)).toHaveLength(6);
  });

  it('marks Zelle, PayPal, Cash App and mailing address as placeholders with the right field', () => {
    for (const field of ['giving.zelle', 'giving.paypalUrl', 'giving.cashAppTag', 'giving.mailingAddress']) {
      expect(doc(), field).toContain(titleFor(field));
    }
    expect((doc().match(/data-placeholder/g) ?? []).length).toBe(4);
  });

  it('the only <a> inside <main> is the real GoFundMe campaign link', () => {
    const main = doc().slice(doc().indexOf('<main'), doc().indexOf('</main>'));
    const hrefs = [...main.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(['https://www.gofundme.com/f/help-build-our-new-church-7tjhd']);
  });

  it('has no <form>, <input> or <iframe>', () => {
    expect(doc()).not.toMatch(/<form\b/i);
    expect(doc()).not.toMatch(/<input\b/i);
    expect(doc()).not.toMatch(/<iframe\b/i);
  });

  it('makes no tax claim', () => {
    expect(doc()).not.toMatch(/tax|501|deductible/i);
  });

  it('marks the Giving nav link as the current page', () => {
    const href = `/${lang}/giving/`;
    expect(doc()).toMatch(new RegExp(`<a href="${href.replace(/\//g, '\\/')}"[^>]*aria-current="page"`));
  });

  it('has no missing-translation markers', () => {
    expect(doc()).not.toContain('⟦missing:');
  });

  it('ships only local module scripts (no external hosts)', () => {
    expect(scriptPolicyViolations(doc())).toEqual([]);
  });
});

describe('GivingDetails with a real (fictional) config', () => {
  const realGiving: SiteConfig['giving'] = {
    zelle: 'giving@example.org',
    paypalUrl: 'https://www.paypal.com/donate/?hosted_button_id=TEST',
    cashAppTag: '$DebreAmin123',
    mailingAddress: '123 Example Ave, Greensboro, NC 27401',
    gofundmeUrl: 'https://www.gofundme.com/f/help-build-our-new-church-7tjhd',
  };

  let doc = '';

  beforeAll(async () => {
    const c = await AstroContainer.create();
    doc = await c.renderToString(GivingDetails, {
      props: { lang: 'en', giving: realGiving },
    });
  });

  it('shows the Zelle value as text, not inside an <a>', () => {
    expect(doc).toContain('giving@example.org');
    expect(doc).not.toMatch(/<a\b[^>]*>\s*giving@example\.org/);
  });

  it('renders a PayPal link matching the real URL', () => {
    expect(doc).toMatch(/<a\b[^>]*href="https:\/\/www\.paypal\.com\/donate\/\?hosted_button_id=TEST"/);
  });

  it('renders a Cash App link built from the tag', () => {
    expect(doc).toMatch(/<a\b[^>]*href="https:\/\/cash\.app\/\$DebreAmin123"/);
    expect(doc).toContain('$DebreAmin123');
  });

  it('renders the mailing address inside <address>', () => {
    expect(doc).toMatch(/<address[\s>][\s\S]*123 Example Ave[\s\S]*<\/address>/);
  });

  it('has no data-placeholder remaining', () => {
    expect(doc).not.toContain('data-placeholder');
  });
});
