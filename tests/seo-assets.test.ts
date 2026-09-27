import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildRobotsTxt } from '../src/pages/robots.txt';

describe('robots.txt', () => {
  it('is correct under the default base', () => {
    expect(buildRobotsTxt('https://example.github.io', '/')).toBe(
      'User-agent: *\nAllow: /\nSitemap: https://example.github.io/sitemap-index.xml\n',
    );
  });

  it('is correct under a project-page base', () => {
    expect(buildRobotsTxt('https://org.github.io', '/debre-amin')).toBe(
      'User-agent: *\nAllow: /\nSitemap: https://org.github.io/debre-amin/sitemap-index.xml\n',
    );
  });

  it('is correct under a project-page base with a trailing slash', () => {
    expect(buildRobotsTxt('https://org.github.io', '/debre-amin/')).toBe(
      'User-agent: *\nAllow: /\nSitemap: https://org.github.io/debre-amin/sitemap-index.xml\n',
    );
  });
});

describe('public/og-image.png', () => {
  const path = resolve(__dirname, '../public/og-image.png');
  const buf = readFileSync(path);

  it('exists and is under 150 KB', () => {
    expect(statSync(path).size).toBeLessThan(150 * 1024);
  });

  it('is a PNG, 1200x630 (read directly from the IHDR chunk)', () => {
    // PNG signature (8 bytes), then the IHDR chunk: 4-byte length, 4-byte
    // "IHDR" type, then width and height as big-endian uint32s.
    const signature = buf.subarray(0, 8);
    expect(signature.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
    expect(buf.subarray(12, 16).toString('ascii')).toBe('IHDR');
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    expect(width).toBe(1200);
    expect(height).toBe(630);
  });
});
