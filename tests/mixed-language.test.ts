import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import ContactDetails from '../src/components/ContactDetails.astro';
import GivingDetails from '../src/components/GivingDetails.astro';
import MixedText from '../src/components/MixedText.astro';
import type { SiteConfig } from '../src/data/site';
import { renderAllPages } from './helpers/pages';

// On Amharic pages, English fragments kept for recognition (brand names,
// source titles, real postal addresses and handles) must carry lang="en".
// Rule: no Latin-script run of 4+ letters may sit in <main>'s text without a
// lang="en" ancestor. URLs and "E.C." are exempt; digits never match.
const LATIN_RUN = /[A-Za-z]{4,}/g;

function unmarkedLatinRuns(root: Element): string[] {
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  const found: string[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement!;
    if (parent.closest('script, style')) continue;
    if (parent.closest('[lang]')?.getAttribute('lang') === 'en') continue;
    const text = (node.textContent ?? '').replace(/https?:\/\/\S+/g, '').replace(/\bE\.C\./g, '');
    found.push(...(text.match(LATIN_RUN) ?? []));
  }
  return found;
}

function mainOf(html: string): Element {
  return new JSDOM(html).window.document.querySelector('main')!;
}

function fragment(html: string): Element {
  return new JSDOM(`<div lang="am">${html}</div>`).window.document.body.firstElementChild!;
}

const amPages = (await renderAllPages()).filter((p) => p.lang === 'am');

describe('Amharic pages mark English fragments with lang="en"', () => {
  it('covers every Amharic page type', () => {
    expect(amPages.length).toBe(13);
  });

  it.each(amPages.map((p) => [p.name, p] as const))('%s', (_n, p) => {
    expect(unmarkedLatinRuns(mainOf(p.html))).toEqual([]);
  });
});

describe('the checker itself', () => {
  it('flags an unmarked Latin word and accepts a marked one', () => {
    expect(unmarkedLatinRuns(fragment('<p>ዜል (Zelle)</p>'))).toEqual(['Zelle']);
    expect(unmarkedLatinRuns(fragment('<p>ዜል (<span lang="en">Zelle</span>)</p>'))).toEqual([]);
    expect(unmarkedLatinRuns(fragment('<p>https://example.org/path 2019 E.C.</p>'))).toEqual([]);
  });
});

describe('MixedText', () => {
  it('wraps Latin runs in lang="en" on am, keeping multi-word names together', async () => {
    const c = await AstroContainer.create();
    const html = (await c.renderToString(MixedText, { props: { lang: 'am', text: 'ካሽ አፕ (Cash App)' } })).replace(
      /\s+data-astro-source-(?:file|loc)="[^"]*"/g,
      '',
    );
    expect(html).toContain('ካሽ አፕ (<span lang="en">Cash App</span>)');
  });

  it('leaves en text untouched', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MixedText, { props: { lang: 'en', text: 'Cash App' } });
    expect(html).not.toContain('<span');
  });
});

describe('real (fictional) English values on Amharic pages', () => {
  it('GivingDetails marks real handles and the mailing address lang="en"', async () => {
    const c = await AstroContainer.create();
    const giving: SiteConfig['giving'] = {
      zelle: 'giving@example.org',
      paypalUrl: 'https://www.paypal.com/donate/?hosted_button_id=TEST',
      cashAppTag: '$DebreAmin123',
      mailingAddress: '123 Example Avenue, Greensboro, NC 27401',
    };
    const html = await c.renderToString(GivingDetails, { props: { lang: 'am', giving } });
    expect(unmarkedLatinRuns(fragment(html))).toEqual([]);
  });

  it('ContactDetails marks the real postal address lang="en"', async () => {
    const c = await AstroContainer.create();
    const contact: SiteConfig['contact'] = {
      phone: '+1 (336) 555-0100',
      email: 'parish@example.org',
      address: { street: '123 Example Avenue', city: 'Greensboro', state: 'NC', postalCode: '27401', country: 'USA' },
      mapUrl: 'https://maps.example.org/debre-amin',
      directions: { en: 'Take exit 5.', am: 'ከ5ኛ መውጫ ይውጡ።' },
    };
    const html = await c.renderToString(ContactDetails, { props: { lang: 'am', contact } });
    expect(unmarkedLatinRuns(fragment(html))).toEqual([]);
  });
});
