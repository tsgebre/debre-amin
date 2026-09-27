import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import { scriptPolicyViolations } from './helpers/script-policy';
import ServicesPage from '../src/pages/[lang]/services.astro';
import { LOCALES, type Locale } from '../src/i18n/index';
import { siteConfig } from '../src/data/site';

type Component = Parameters<AstroContainer['renderToString']>[0];
// getStaticPaths pages without Props are typed `(props: never)`, which the container signature rejects.
const ServicesPageComponent = ServicesPage as unknown as Component;

let container: AstroContainer;
const html: Partial<Record<Locale, string>> = {};

beforeAll(async () => {
  container = await AstroContainer.create();
  for (const lang of LOCALES) {
    html[lang] = await container.renderToString(ServicesPageComponent, {
      params: { lang },
      request: new Request(`http://localhost/${lang}/services/`),
    });
  }
});

function stripAttributes(doc: string): string {
  return doc.replace(/<[a-zA-Z][^>]*>/g, (tag) => tag.replace(/\s[a-zA-Z-]+="[^"]*"/g, ''));
}

describe.each(LOCALES)('services page — %s', (lang) => {
  const doc = () => html[lang]!;

  it('sets <html lang> correctly', () => {
    expect(doc()).toMatch(new RegExp(`<html[^>]*\\blang="${lang}"`));
  });

  it('has exactly one <h1>', () => {
    expect(doc().match(/<h1\b/g)).toHaveLength(1);
  });

  it('has a table caption and three scoped column headers', () => {
    expect(doc()).toMatch(/<caption[\s>]/);
    expect(doc()).toMatch(lang === 'en' ? />Schedule of services<\/caption>/ : />የአገልግሎት መርሐ ግብር<\/caption>/);
    const headers = doc().match(/<th\b[^>]*scope="col"[^>]*>/g) ?? [];
    expect(headers).toHaveLength(3);
  });

  it('renders one row per configured service', () => {
    const tbody = doc().slice(doc().indexOf('<tbody'), doc().indexOf('</tbody>'));
    const rows = tbody.match(/<tr\b/g) ?? [];
    expect(rows).toHaveLength(siteConfig.services.length);
  });

  it('marks every day and time cell as a placeholder', () => {
    const tbody = doc().slice(doc().indexOf('<tbody'), doc().indexOf('</tbody>'));
    const rowMatches = [...tbody.matchAll(/<tr\b[\s\S]*?<\/tr>/g)];
    expect(rowMatches).toHaveLength(siteConfig.services.length);
    for (const [row] of rowMatches) {
      const placeholderCount = (row.match(/data-placeholder/g) ?? []).length;
      expect(placeholderCount).toBe(2); // day + time, both placeholders in the current config
    }
  });

  it('labels each day placeholder with its language-specific config path', () => {
    for (let i = 0; i < siteConfig.services.length; i++) {
      expect(doc()).toContain(`title="Replace in src/data/site.ts: services.${i}.day.${lang}"`);
    }
  });

  it('ships only local module scripts (no external hosts)', () => {
    expect(scriptPolicyViolations(doc())).toEqual([]);
  });

  it('has no missing-translation markers', () => {
    expect(doc()).not.toContain('⟦missing:');
  });

  it('marks the Services nav link as the current page', () => {
    const href = lang === 'en' ? '/en/services/' : '/am/services/';
    expect(doc()).toMatch(new RegExp(`<a href="${href.replace(/\//g, '\\/')}"[^>]*aria-current="page"`));
  });

  it('shows no raw "TBD —" marker text outside title attributes', () => {
    expect(stripAttributes(doc())).not.toContain('TBD —');
  });
});
