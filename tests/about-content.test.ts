import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { ABOUT_SECTIONS, aboutSchema } from '../src/content/schemas';

const DIR = resolve(__dirname, '../src/content/about');
const ETHIOPIC = /[ሀ-፿]/;
const LATIN_RUN = /[A-Za-z]{4,}/g;
// Latin words genuinely needed in Amharic bodies; keep this empty unless unavoidable.
const AM_LATIN_ALLOWLIST: string[] = [];

const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.md'))
  .map((name) => {
    const parsed = matter(readFileSync(resolve(DIR, name), 'utf-8'));
    return { name, data: parsed.data, body: parsed.content };
  });

describe('about content files', () => {
  it('exist', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((f) => [f.name, f] as const))('%s matches the schema', (_name, f) => {
    const result = aboutSchema.safeParse(f.data);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });

  it('every section exists in both en and am', () => {
    for (const section of ABOUT_SECTIONS) {
      for (const lang of ['en', 'am']) {
        const found = files.some((f) => f.data.section === section && f.data.lang === lang);
        expect(found, `${section}.${lang}`).toBe(true);
      }
    }
  });

  it('every file is research-verified', () => {
    for (const f of files) expect(f.data.researchVerified, f.name).toBe(true);
  });

  it('every source URL is https://', () => {
    for (const f of files) {
      for (const s of f.data.sources ?? []) expect(s.url, f.name).toMatch(/^https:\/\//);
    }
  });

  it('every am file is flagged for review, in Ethiopic, with no Latin words', () => {
    for (const f of files.filter((x) => x.data.lang === 'am')) {
      expect(f.data.amReviewPending, f.name).toBe(true);
      expect(ETHIOPIC.test(f.body), f.name).toBe(true);
      const latin = (f.body.match(LATIN_RUN) ?? []).filter((w) => !AM_LATIN_ALLOWLIST.includes(w));
      expect(latin, f.name).toEqual([]);
    }
  });
});

describe('aboutSchema rejects bad frontmatter', () => {
  const valid = {
    title: 'T',
    lang: 'en',
    section: 'eotc',
    order: 1,
    sources: [
      { title: 'A', url: 'https://example.org/a' },
      { title: 'B', url: 'https://example.org/b' },
    ],
    researchVerified: true,
    amReviewPending: false,
  };

  it('accepts a valid entry', () => {
    expect(aboutSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing sources', () => {
    const { sources: _omit, ...rest } = valid;
    expect(aboutSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects fewer than two sources', () => {
    expect(aboutSchema.safeParse({ ...valid, sources: [valid.sources[0]] }).success).toBe(false);
  });

  it("rejects lang: 'fr'", () => {
    expect(aboutSchema.safeParse({ ...valid, lang: 'fr' }).success).toBe(false);
  });

  it('rejects an http:// source', () => {
    const sources = [valid.sources[0], { title: 'B', url: 'http://example.org/b' }];
    expect(aboutSchema.safeParse({ ...valid, sources }).success).toBe(false);
  });

  it('rejects researchVerified: false', () => {
    expect(aboutSchema.safeParse({ ...valid, researchVerified: false }).success).toBe(false);
  });
});
