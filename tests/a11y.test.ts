import { describe, expect, it } from 'vitest';
import { formatViolations, runAxe } from './helpers/axe';
import { renderAllPages } from './helpers/pages';

// Every page type, both locales, through axe-core's WCAG 2.1 A/AA rules.
// (color-contrast is covered by tests/tokens.test.ts — see helpers/axe.ts.)
const pages = await renderAllPages();

describe('axe harness self-test', () => {
  it('reports known violations (so a clean result is meaningful)', async () => {
    const bad =
      '<!doctype html><html><head><title>x</title></head><body>' +
      '<main><img src="a.png"><a href="/x"></a><p lang="xx-nope">t</p></main></body></html>';
    const ids = (await runAxe(bad)).map((v) => v.id).sort();
    expect(ids).toEqual(['html-has-lang', 'image-alt', 'link-name', 'valid-lang']);
  });
});

describe('axe-core WCAG 2.1 AA audit', () => {
  it('covers every page type in both locales', () => {
    expect(pages.length).toBe(28);
  });

  // axe in jsdom is CPU-bound; under full-suite contention a single page can
  // pass vitest's 5 s default, so allow headroom rather than flake in CI.
  it.each(pages.map((p) => [p.name, p] as const))(
    '%s has no violations',
    async (_name, p) => {
      const violations = await runAxe(p.html);
      expect(violations, formatViolations(violations)).toEqual([]);
    },
    30_000,
  );
});
