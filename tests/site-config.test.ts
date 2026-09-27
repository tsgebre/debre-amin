import { describe, expect, it } from 'vitest';
import {
  emailOrPh,
  phoneOrPh,
  placeholderFields,
  siteConfig,
  siteConfigSchema,
  urlOrPh,
} from '../src/data/site';
import { isPlaceholder } from '../src/data/placeholder';

const ETHIOPIC = /[ሀ-፿]/;
// Digit sequences that look like a phone number or a clock time, or an "@".
const LOOKS_LIKE_A_REAL_FACT = /\d{3,}|\d{1,2}:\d{2}|@/;

function leaves(value: unknown, path: string[] = []): { path: string; value: string }[] {
  if (typeof value === 'string') return [{ path: path.join('.'), value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, [...path, String(i)]));
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, [...path, k]));
  }
  return [];
}

describe('siteConfig', () => {
  it('parses at module load without throwing', () => {
    expect(() => siteConfigSchema.parse(siteConfig)).not.toThrow();
  });
});

describe('phoneOrPh', () => {
  it('accepts a well-formed +1 phone number', () => {
    expect(phoneOrPh.parse('+1 (336) 555-0123')).toBe('+1 (336) 555-0123');
    expect(() => phoneOrPh.parse('+13365550123')).not.toThrow();
  });

  it('rejects a malformed phone number', () => {
    expect(() => phoneOrPh.parse('555-1234')).toThrow();
  });

  it('rejects a placeholder missing the required prefix', () => {
    expect(() => phoneOrPh.parse('TBD phone')).toThrow();
  });

  it('accepts a well-formed placeholder', () => {
    expect(() => phoneOrPh.parse('TBD — replace in src/data/site.ts (contact.phone)')).not.toThrow();
  });
});

describe('emailOrPh', () => {
  it('accepts a well-formed email', () => {
    expect(() => emailOrPh.parse('parish@example.org')).not.toThrow();
  });

  it('rejects an invalid email', () => {
    expect(() => emailOrPh.parse('not-an-email')).toThrow();
  });
});

describe('urlOrPh', () => {
  it('accepts an absolute https URL', () => {
    expect(() => urlOrPh.parse('https://example.org/map')).not.toThrow();
  });

  it('rejects a non-https URL', () => {
    expect(() => urlOrPh.parse('http://example.org/map')).toThrow();
  });
});

describe('cashAppTag (checked through the full schema)', () => {
  function withGiving(cashAppTag: string) {
    return structuredClone({
      ...siteConfig,
      giving: { ...siteConfig.giving, cashAppTag },
    });
  }

  it('accepts a well-formed cashtag', () => {
    expect(() => siteConfigSchema.parse(withGiving('$DebreAmin123'))).not.toThrow();
  });

  it('rejects a cashtag missing the leading "$"', () => {
    expect(() => siteConfigSchema.parse(withGiving('DebreAmin123'))).toThrow();
  });
});

describe('placeholderFields', () => {
  const fields = new Set(placeholderFields(siteConfig));

  it('flags every contact placeholder', () => {
    expect(fields.has('contact.phone')).toBe(true);
    expect(fields.has('contact.email')).toBe(true);
    expect(fields.has('contact.address.street')).toBe(true);
  });

  it('flags day and time for every service', () => {
    for (let i = 0; i < siteConfig.services.length; i++) {
      expect(fields.has(`services.${i}.day`)).toBe(true);
      expect(fields.has(`services.${i}.time`)).toBe(true);
    }
  });

  it('flags the name of every clergy member', () => {
    for (let i = 0; i < siteConfig.clergy.length; i++) {
      expect(fields.has(`clergy.${i}.name.en`)).toBe(true);
    }
  });

  it('flags every giving field', () => {
    expect(fields.has('giving.zelle')).toBe(true);
    expect(fields.has('giving.paypalUrl')).toBe(true);
    expect(fields.has('giving.cashAppTag')).toBe(true);
    expect(fields.has('giving.mailingAddress')).toBe(true);
  });
});

describe('content honesty', () => {
  const nonPlaceholderLeaves = leaves(siteConfig).filter((l) => !isPlaceholder(l.value));

  it('has no invented real-world facts outside placeholders', () => {
    const offenders = nonPlaceholderLeaves.filter((l) => LOOKS_LIKE_A_REAL_FACT.test(l.value));
    expect(offenders).toEqual([]);
  });

  it('every non-placeholder Amharic value is genuine Ethiopic script', () => {
    const offenders = nonPlaceholderLeaves
      .filter((l) => l.path.endsWith('.am'))
      .filter((l) => !ETHIOPIC.test(l.value));
    expect(offenders).toEqual([]);
  });

  it('the only non-placeholder leaves are the known real values', () => {
    const allowed = new Set(nonPlaceholderLeaves.map((l) => l.path.replace(/^services\.\d+/, 'services.N')));
    expect([...allowed].sort()).toEqual(
      [
        'contact.address.city',
        'contact.address.state',
        'contact.address.country',
        'services.N.name.en',
        'services.N.name.am',
        'services.N.id',
        'clergy.0.id',
        'clergy.1.id',
        'clergy.2.id',
      ].sort(),
    );
  });
});
