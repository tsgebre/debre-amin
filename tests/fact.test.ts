import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import Fact from '../src/components/Fact.astro';
import { ph } from '../src/data/placeholder';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

function stripAttributes(html: string): string {
  return html.replace(/<[a-zA-Z][^>]*>/g, (tag) => tag.replace(/\s[a-zA-Z-]+="[^"]*"/g, ''));
}

describe('Fact — placeholder value', () => {
  it('renders the placeholder badge with the field in the title, and no raw marker text', async () => {
    const value = ph('contact.phone');
    const doc = await container.renderToString(Fact, {
      props: { lang: 'en', value, field: 'contact.phone' },
    });
    expect(doc).toContain('data-placeholder');
    expect(doc).toContain('title="Replace in src/data/site.ts: contact.phone"');
    expect(doc).toContain('To be announced');

    const visibleText = stripAttributes(doc);
    expect(visibleText).not.toContain('TBD —');
  });
});

describe('Fact — real value', () => {
  it('renders the value with no placeholder markup', async () => {
    const doc = await container.renderToString(Fact, {
      props: { lang: 'en', value: 'Sunday', field: 'contact.phone' },
    });
    expect(doc).toContain('Sunday');
    expect(doc).not.toContain('data-placeholder');
    expect(doc).not.toContain('placeholder-badge');
  });
});

describe('Fact — link mode', () => {
  it('renders an anchor for a real URL', async () => {
    const doc = await container.renderToString(Fact, {
      props: { lang: 'en', value: 'https://example.org/live', field: 'livestreamUrl', as: 'link' },
    });
    expect(doc).toMatch(/<a\b[^>]*href="https:\/\/example\.org\/live"/);
  });

  it('renders no anchor for a placeholder URL', async () => {
    const value = ph('livestreamUrl');
    const doc = await container.renderToString(Fact, {
      props: { lang: 'en', value, field: 'livestreamUrl', as: 'link' },
    });
    expect(doc).not.toMatch(/<a\b/);
    expect(doc).toContain('data-placeholder');
  });
});
