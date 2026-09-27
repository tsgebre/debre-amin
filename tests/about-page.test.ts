import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import AboutSection from '../src/components/AboutSection.astro';
import AboutView from '../src/components/AboutView.astro';
import ParishHistory from '../src/components/ParishHistory.astro';
import FixtureBody from './fixtures/FixtureBody.astro';
import { LOCALES, type Locale } from '../src/i18n/index';
import { siteConfig } from '../src/data/site';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const sources = [
  { title: 'Source A', url: 'https://example.org/a' },
  { title: 'Source B', url: 'https://example.org/b' },
];

// The Container API cannot load content collections inside vitest, so the
// page's data loading stays in about.astro and the full rendered view is
// tested here through AboutView with fixture <Content /> components.
function stripAttributes(doc: string): string {
  return doc.replace(/<[a-zA-Z][^>]*>/g, (tag) => tag.replace(/\s[a-zA-Z-]+="[^"]*"/g, ''));
}

describe.each(LOCALES)('About view — %s', (lang: Locale) => {
  let doc = '';

  beforeAll(async () => {
    doc = await container.renderToString(AboutView, {
      props: {
        lang,
        history: siteConfig.parish.history,
        sections: [
          { title: 'EOTC', sources, amReviewPending: lang === 'am', Content: FixtureBody },
          { title: 'Saint', sources, amReviewPending: lang === 'am', Content: FixtureBody },
        ],
      },
      request: new Request(`http://localhost/${lang}/about/`),
    });
  });

  it('sets <html lang> correctly', () => {
    expect(doc).toMatch(new RegExp(`<html[^>]*\\blang="${lang}"`));
  });

  it('has exactly one <h1>', () => {
    expect(doc.match(/<h1\b/g)).toHaveLength(1);
  });

  it('marks the parish history as a placeholder', () => {
    expect(doc).toContain(`title="Replace in src/data/site.ts: parish.history.${lang}"`);
  });

  it('renders both researched sections with their bodies and source links', () => {
    expect(doc.match(/Fixture body text/g)).toHaveLength(2);
    expect(doc.match(/href="https:\/\/example\.org\/a"/g)).toHaveLength(2);
  });

  it('shows the am review note on am only', () => {
    const notes = (doc.match(/class="review-note"/g) ?? []).length;
    expect(notes).toBe(lang === 'am' ? 2 : 0);
  });

  it('marks the About nav link as the current page', () => {
    expect(doc).toMatch(new RegExp(`<a href="\\/${lang}\\/about\\/"[^>]*aria-current="page"`));
  });

  it('has no missing-translation markers or raw placeholder text', () => {
    expect(doc).not.toContain('⟦missing:');
    expect(stripAttributes(doc)).not.toContain('TBD —');
  });
});

describe.each(LOCALES)('ParishHistory — %s', (lang) => {
  it('renders an <h2> and marks the history slot as a placeholder', async () => {
    const doc = await container.renderToString(ParishHistory, {
      props: { lang, history: siteConfig.parish.history },
    });
    expect(doc).toMatch(/<h2\b/);
    expect(doc).toContain('data-placeholder');
    expect(doc).toContain(`title="Replace in src/data/site.ts: parish.history.${lang}"`);
    expect(doc).not.toContain('⟦missing:');
  });
});

describe('AboutSection', () => {
  it('renders the title, body slot and source links', async () => {
    const doc = await container.renderToString(AboutSection, {
      props: { lang: 'en', title: 'Section Title', sources, amReviewPending: false },
      slots: { default: '<p>Body text</p>' },
    });
    expect(doc).toMatch(/<h2[^>]*>Section Title<\/h2>/);
    expect(doc).toContain('<p>Body text</p>');
    expect(doc).toMatch(/<a\b[^>]*href="https:\/\/example\.org\/a"/);
    expect(doc).toMatch(/<a\b[^>]*href="https:\/\/example\.org\/b"/);
    expect(doc).toMatch(/<details\b/);
    expect(doc).not.toContain('⟦missing:');
  });

  it('shows the review note on am when review is pending', async () => {
    const doc = await container.renderToString(AboutSection, {
      props: { lang: 'am', title: 'ርዕስ', sources, amReviewPending: true },
    });
    expect(doc).toContain('ይህ ትርጉም በደብሩ እየተገመገመ ነው።');
    expect(doc).toContain('class="review-note"');
  });

  it('never shows the review note on en', async () => {
    const doc = await container.renderToString(AboutSection, {
      props: { lang: 'en', title: 'Title', sources, amReviewPending: true },
    });
    expect(doc).not.toContain('review-note');
  });

  it('hides the review note on am once review is done', async () => {
    const doc = await container.renderToString(AboutSection, {
      props: { lang: 'am', title: 'ርዕስ', sources, amReviewPending: false },
    });
    expect(doc).not.toContain('review-note');
  });
});
