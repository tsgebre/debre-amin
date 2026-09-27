import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { GALLERY_AM_NEEDS_REVIEW, gallerySchema } from '../src/content/schemas';
import { missingImages } from '../src/lib/gallery';

const GALLERY_DIR = resolve(__dirname, '../src/content/gallery');
const PUBLIC_DIR = resolve(__dirname, '../public');
const IMAGES_DIR = resolve(PUBLIC_DIR, 'images/gallery');
const ETHIOPIC = /[ሀ-፿]/;

const files = readdirSync(GALLERY_DIR)
  .filter((f) => f.endsWith('.yaml') && !f.startsWith('_'))
  .map((name) => ({ name, slug: name.replace(/\.yaml$/, ''), data: parseYaml(readFileSync(resolve(GALLERY_DIR, name), 'utf-8')) }));

describe('shipped gallery entries', () => {
  it('exist', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((f) => [f.name, f] as const))('%s matches the schema', (_name, f) => {
    const result = gallerySchema.safeParse(f.data);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });

  it('every referenced image exists under public/', () => {
    for (const f of files) {
      expect(existsSync(resolve(PUBLIC_DIR, f.data.image)), f.data.image).toBe(true);
    }
  });

  it("every entry's alt.am contains Ethiopic characters", () => {
    for (const f of files) {
      expect(ETHIOPIC.test(f.data.alt.am), f.name).toBe(true);
    }
  });

  it('every placeholder entry is listed in GALLERY_AM_NEEDS_REVIEW', () => {
    for (const f of files.filter((x) => x.data.placeholder)) {
      expect(GALLERY_AM_NEEDS_REVIEW, f.name).toContain(f.slug);
    }
  });

  it('does not give the six placeholder entries identical captions', () => {
    const captions = files.filter((f) => f.data.placeholder).map((f) => f.data.caption?.en);
    expect(new Set(captions).size).toBe(captions.length);
  });
});

describe('gallery placeholder SVGs (public/images/gallery/)', () => {
  const svgFiles = readdirSync(IMAGES_DIR).filter((f) => f.endsWith('.svg'));

  it('exist (one per shipped placeholder entry)', () => {
    expect(svgFiles.length).toBeGreaterThan(0);
  });

  it.each(svgFiles)('%s has no <text, no external http reference, and is 800x600', (name) => {
    const svg = readFileSync(resolve(IMAGES_DIR, name), 'utf-8');
    expect(svg.trimStart().startsWith('<svg') || svg.trimStart().startsWith('<?xml'), name).toBe(true);
    expect(svg, name).not.toMatch(/<text/i);
    expect(svg, name).not.toMatch(/xlink:href="http/i);
    // The one allowed "http" is the standard xmlns namespace declaration.
    const withoutNamespace = svg.replace(/xmlns(:xlink)?="http:\/\/[^"]*"/g, '');
    expect(withoutNamespace, name).not.toMatch(/http/i);
    expect(svg, name).toMatch(/width="800"/);
    expect(svg, name).toMatch(/height="600"/);
  });

  it('total size of the six SVGs is well under 30 KB', () => {
    const total = svgFiles.reduce((sum, name) => sum + readFileSync(resolve(IMAGES_DIR, name)).byteLength, 0);
    expect(total).toBeLessThan(30 * 1024);
  });
});

describe('gallerySchema rejects bad frontmatter', () => {
  const valid = {
    image: 'images/gallery/a-photo.jpg',
    width: 800,
    height: 600,
    alt: { en: 'A photo', am: 'ፎቶ' },
  };

  it('accepts a valid entry', () => {
    expect(gallerySchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an https:// image (must be a local file)', () => {
    expect(gallerySchema.safeParse({ ...valid, image: 'https://example.org/a.jpg' }).success).toBe(false);
  });

  it('rejects a path-traversal image path', () => {
    expect(gallerySchema.safeParse({ ...valid, image: '../x.jpg' }).success).toBe(false);
  });

  it('rejects uppercase letters in the filename', () => {
    expect(gallerySchema.safeParse({ ...valid, image: 'images/gallery/Photo.jpg' }).success).toBe(false);
  });

  it('rejects a missing width', () => {
    const { width: _w, ...rest } = valid;
    expect(gallerySchema.safeParse(rest).success).toBe(false);
  });

  it('rejects an empty alt.am', () => {
    expect(gallerySchema.safeParse({ ...valid, alt: { en: 'A photo', am: '' } }).success).toBe(false);
  });

  it('rejects date: 2026-13-01 (no month 13)', () => {
    expect(gallerySchema.safeParse({ ...valid, date: '2026-13-01' }).success).toBe(false);
  });

  it('rejects an unknown field (strict schema catches typos)', () => {
    expect(gallerySchema.safeParse({ ...valid, cation: { en: 'x', am: 'y' } }).success).toBe(false);
  });

  it('defaults placeholder to false', () => {
    const result = gallerySchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.placeholder).toBe(false);
  });
});

describe('missingImages', () => {
  function fixtureData(image: string) {
    return {
      image,
      width: 800,
      height: 600,
      alt: { en: 'A photo', am: 'ፎቶ' },
      placeholder: false,
    };
  }

  it('detects a fixture entry whose image file does not exist', () => {
    const items = [
      { slug: 'ok', data: fixtureData('images/gallery/placeholder-1.svg') },
      { slug: 'broken', data: fixtureData('images/gallery/does-not-exist.svg') },
    ];
    const missing = missingImages(items, PUBLIC_DIR);
    expect(missing.map((m) => m.slug)).toEqual(['broken']);
  });
});
