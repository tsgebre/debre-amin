import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import { scriptPolicyViolations } from './helpers/script-policy';
import ContactPage from '../src/pages/[lang]/contact.astro';
import ContactDetails from '../src/components/ContactDetails.astro';
import { LOCALES, type Locale } from '../src/i18n/index';
import type { SiteConfig } from '../src/data/site';

type Component = Parameters<AstroContainer['renderToString']>[0];
// getStaticPaths pages without Props are typed `(props: never)`, which the container signature rejects.
const ContactPageComponent = ContactPage as unknown as Component;

let container: AstroContainer;
const html: Partial<Record<Locale, string>> = {};

beforeAll(async () => {
  container = await AstroContainer.create();
  for (const lang of LOCALES) {
    html[lang] = await container.renderToString(ContactPageComponent, {
      params: { lang },
      request: new Request(`http://localhost/${lang}/contact/`),
    });
  }
});

function stripAttributes(doc: string): string {
  return doc.replace(/<[a-zA-Z][^>]*>/g, (tag) => tag.replace(/\s[a-zA-Z-]+="[^"]*"/g, ''));
}

function titleFor(field: string): string {
  return `title="Replace in src/data/site.ts: ${field}"`;
}

describe.each(LOCALES)('contact page — %s', (lang) => {
  const doc = () => html[lang]!;

  it('sets <html lang> correctly', () => {
    expect(doc()).toMatch(new RegExp(`<html[^>]*\\blang="${lang}"`));
  });

  it('has exactly one <h1>', () => {
    expect(doc().match(/<h1\b/g)).toHaveLength(1);
  });

  it('has an <address> element that contains the real street address', () => {
    expect(doc()).toMatch(/<address[\s>]/);
    const address = doc().slice(doc().indexOf('<address'), doc().indexOf('</address>'));
    expect(address).toContain('1311 Starr Dr');
    expect(address).toContain('High Point');
    expect(address).toContain('27260');
  });

  it('marks email and directions as the remaining placeholders with the right field', () => {
    const directionsField = `contact.directions.${lang}`;
    for (const field of ['contact.email', directionsField]) {
      expect(doc(), field).toContain(titleFor(field));
    }
    expect((doc().match(/data-placeholder/g) ?? []).length).toBe(2);
  });

  it('has no <iframe>; the real phone and map link, the placeholder email does not', () => {
    expect(doc()).not.toMatch(/<iframe/i);
    expect(doc()).not.toContain('mailto:');
    const main = doc().slice(doc().indexOf('<main'), doc().indexOf('</main>'));
    const hrefs = [...main.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual([
      'tel:+13366152910',
      'https://maps.google.com/?q=1311+Starr+Dr,+High+Point,+NC+27260',
    ]);
  });

  it('marks the Contact nav link as the current page', () => {
    const href = `/${lang}/contact/`;
    expect(doc()).toMatch(new RegExp(`<a href="${href.replace(/\//g, '\\/')}"[^>]*aria-current="page"`));
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

describe('ContactDetails with a real (fictional) config', () => {
  // 555-01XX numbers are reserved fictional numbers; test data only.
  const realContact: SiteConfig['contact'] = {
    phone: '+1 (336) 555-0100',
    email: 'parish@example.org',
    address: {
      street: '123 Example Ave',
      city: 'Greensboro',
      state: 'NC',
      postalCode: '27401',
      country: 'USA',
    },
    mapUrl: 'https://maps.example.org/debre-amin',
    directions: { en: 'Take exit 5 and turn right.', am: 'ከ5ኛ መውጫ ወደ ቀኝ ይታጠፉ።' },
  };

  it('renders tel:, mailto: and map links for real values', async () => {
    const container = await AstroContainer.create();
    const doc = await container.renderToString(ContactDetails, {
      props: { lang: 'en', contact: realContact },
    });
    expect(doc).toMatch(/<a\b[^>]*href="tel:\+13365550100"/);
    expect(doc).toMatch(/<a\b[^>]*href="mailto:parish@example\.org"/);
    expect(doc).toMatch(/<a\b[^>]*href="https:\/\/maps\.example\.org\/debre-amin"/);
    expect(doc).toContain('123 Example Ave');
    expect(doc).toContain('Take exit 5 and turn right.');
    expect(doc).not.toContain('data-placeholder');
  });
});
