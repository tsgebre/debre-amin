import { describe, expect, it } from 'vitest';
import { mailtoHref, telHref } from '../src/data/links';

describe('telHref', () => {
  it('normalises a formatted phone number to tel:+1XXXXXXXXXX', () => {
    // 555-01XX numbers are reserved fictional numbers (RFC 3092 style); test data only.
    expect(telHref('+1 (336) 555-0100')).toBe('tel:+13365550100');
  });

  it('passes through an already-normalised number', () => {
    expect(telHref('+13365550100')).toBe('tel:+13365550100');
  });

  it('strips dashes', () => {
    expect(telHref('+1-336-555-0100')).toBe('tel:+13365550100');
  });
});

describe('mailtoHref', () => {
  it('prefixes the email with mailto:', () => {
    expect(mailtoHref('parish@example.org')).toBe('mailto:parish@example.org');
  });
});
