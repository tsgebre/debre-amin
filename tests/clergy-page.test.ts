import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import { scriptPolicyViolations } from './helpers/script-policy';
import ClergyPage from '../src/pages/[lang]/clergy.astro';
import ClergyCard from '../src/components/ClergyCard.astro';
import ClergyList from '../src/components/ClergyList.astro';
import { LOCALES, type Locale } from '../src/i18n/index';
import { siteConfig } from '../src/data/site';

type Component = Parameters<AstroContainer['renderToString']>[0];
// getStaticPaths pages without Props are typed `(props: never)`, which the container signature rejects.
const ClergyPageComponent = ClergyPage as unknown as Component;

let container: AstroContainer;
const html: Partial<Record<Locale, string>> = {};

beforeAll(async () => {
  container = await AstroContainer.create();
  for (const lang of LOCALES) {
    html[lang] = await container.renderToString(ClergyPageComponent, {
      params: { lang },
      request: new Request(`http://localhost/${lang}/clergy/`),
    });
  }
});

function stripAttributes(doc: string): string {
  return doc.replace(/<[a-zA-Z][^>]*>/g, (tag) => tag.replace(/\s[a-zA-Z-]+="[^"]*"/g, ''));
}

function titleFor(field: string): string {
  return `title="Replace in src/data/site.ts: ${field}"`;
}

describe.each(LOCALES)('clergy page — %s', (lang) => {
  const doc = () => html[lang]!;

  it('sets <html lang> correctly', () => {
    expect(doc()).toMatch(new RegExp(`<html[^>]*\\blang="${lang}"`));
  });

  it('has exactly one <h1>', () => {
    expect(doc().match(/<h1\b/g)).toHaveLength(1);
  });

  it('renders one <article> per configured clergy member', () => {
    const articles = doc().match(/<article\b/g) ?? [];
    expect(articles).toHaveLength(siteConfig.clergy.length);
  });

  it('every <img> has a non-empty alt with no "TBD", and a placeholder src', () => {
    const imgs = [...doc().matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    expect(imgs).toHaveLength(siteConfig.clergy.length);
    for (const img of imgs) {
      const alt = /\balt="([^"]*)"/.exec(img)?.[1];
      expect(alt, img).toBeTruthy();
      expect(alt, img).not.toContain('TBD');
      const src = /\bsrc="([^"]*)"/.exec(img)?.[1];
      expect(src, img).toMatch(/images\/clergy\/placeholder\.svg$/);
    }
  });

  it('marks every name and role as a placeholder with the right field', () => {
    for (let i = 0; i < siteConfig.clergy.length; i++) {
      expect(doc()).toContain(titleFor(`clergy.${i}.name.${lang}`));
      expect(doc()).toContain(titleFor(`clergy.${i}.role.${lang}`));
    }
  });

  it('marks the Clergy nav link as the current page', () => {
    const href = `/${lang}/clergy/`;
    expect(doc()).toMatch(
      new RegExp(`<a href="${href.replace(/\//g, '\\/')}"[^>]*aria-current="page"`),
    );
  });

  it('ships only local module scripts (no external hosts)', () => {
    expect(scriptPolicyViolations(doc())).toEqual([]);
  });

  it('has no missing-translation markers', () => {
    expect(doc()).not.toContain('⟦missing:');
  });

  it('shows no raw "TBD —" marker text outside title attributes', () => {
    expect(stripAttributes(doc())).not.toContain('TBD —');
  });
});

describe('ClergyCard with a real (fictional) fixture', () => {
  const person = {
    id: 'test-person',
    name: { en: 'Test Name', am: 'የሙከራ ስም' },
    role: { en: 'Test Role', am: 'የሙከራ ሚና' },
    photo: 'images/clergy/test.jpg',
  };

  it('renders the real photo, name and role with no placeholder markup', async () => {
    const container = await AstroContainer.create();
    const doc = await container.renderToString(ClergyCard, {
      props: { lang: 'en', person, index: 0 },
    });
    expect(doc).toMatch(/<img\b[^>]*src="[^"]*images\/clergy\/test\.jpg"/);
    expect(doc).toMatch(/<img\b[^>]*alt="Test Name"/);
    expect(doc).toContain('Test Name');
    expect(doc).toContain('Test Role');
    expect(doc).not.toContain('data-placeholder');
  });
});

describe('ClergyList empty state', () => {
  it('renders the empty-state message instead of a grid when there is no clergy', async () => {
    const container = await AstroContainer.create();
    const doc = await container.renderToString(ClergyList, {
      props: { lang: 'en', clergy: [] },
    });
    expect(doc).toContain('Clergy information will be posted here soon.');
    expect(doc).not.toMatch(/<article\b/);
    expect(doc).not.toMatch(/class="clergy-grid"/);
  });
});
