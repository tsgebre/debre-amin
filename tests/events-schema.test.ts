import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { eventSchema } from '../src/content/schemas';

const TEMPLATE_PATH = resolve(__dirname, '../src/content/events/_TEMPLATE.md');
const FIXTURES_DIR = resolve(__dirname, 'fixtures/events');

describe('_TEMPLATE.md', () => {
  it('matches the schema once draft is set to false (it stays unpublished by its filename regardless)', () => {
    const parsed = matter(readFileSync(TEMPLATE_PATH, 'utf-8'));
    const result = eventSchema.safeParse({ ...parsed.data, draft: false });
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });
});

describe('fixture events', () => {
  const files = readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((name) => {
      const parsed = matter(readFileSync(resolve(FIXTURES_DIR, name), 'utf-8'));
      return { name, data: parsed.data, body: parsed.content };
    });

  it('exist', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((f) => [f.name, f] as const))('%s matches the schema', (_name, f) => {
    const result = eventSchema.safeParse(f.data);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });
});

describe('eventSchema rejects bad frontmatter', () => {
  const valid = {
    type: 'event',
    title: { en: 'Fixture Event', am: 'ፊክስቸር ዝግጅት' },
    summary: { en: 'A fixture summary.', am: 'የፊክስቸር ማጠቃለያ።' },
    date: '2027-01-15',
    bodyLang: 'en',
    draft: false,
  };

  it('accepts a valid entry', () => {
    expect(eventSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a valid entry with all optional fields', () => {
    const full = {
      ...valid,
      endDate: '2027-01-16',
      time: '1:00 PM',
      location: { en: 'Hall', am: 'አዳራሽ' },
    };
    expect(eventSchema.safeParse(full).success).toBe(true);
  });

  it('applies defaults for bodyLang and draft when omitted', () => {
    const { bodyLang: _b, draft: _d, ...rest } = valid;
    const result = eventSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bodyLang).toBe('en');
      expect(result.data.draft).toBe(false);
    }
  });

  it('rejects a missing title.am', () => {
    const { title, ...rest } = valid;
    const { am: _am, ...titleWithoutAm } = title;
    expect(eventSchema.safeParse({ ...rest, title: titleWithoutAm }).success).toBe(false);
  });

  it('rejects date: 2026-02-30 (not a real Gregorian date)', () => {
    expect(eventSchema.safeParse({ ...valid, date: '2026-02-30' }).success).toBe(false);
  });

  it("rejects date: '09/27/2026' (wrong format)", () => {
    expect(eventSchema.safeParse({ ...valid, date: '09/27/2026' }).success).toBe(false);
  });

  it('rejects an endDate before date', () => {
    expect(eventSchema.safeParse({ ...valid, date: '2027-01-15', endDate: '2027-01-14' }).success).toBe(
      false,
    );
  });

  it("rejects type: 'party'", () => {
    expect(eventSchema.safeParse({ ...valid, type: 'party' }).success).toBe(false);
  });

  it("rejects bodyLang: 'fr'", () => {
    expect(eventSchema.safeParse({ ...valid, bodyLang: 'fr' }).success).toBe(false);
  });

  it('accepts an endDate equal to date (a same-day event)', () => {
    expect(eventSchema.safeParse({ ...valid, date: '2027-01-15', endDate: '2027-01-15' }).success).toBe(
      true,
    );
  });
});
