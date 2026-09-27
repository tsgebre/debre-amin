import { describe, expect, it } from 'vitest';
import { resolveDeployEnv } from '../src/config/deploy';
import { localizedPath } from '../src/i18n/paths';

describe('resolveDeployEnv', () => {
  it('falls back to defaults with no env', () => {
    expect(resolveDeployEnv({})).toEqual({ site: 'https://example.github.io', base: '/' });
  });

  it("treats an empty BASE_PATH (user/org site or custom domain) as '/'", () => {
    expect(resolveDeployEnv({ BASE_PATH: '' }).base).toBe('/');
    expect(resolveDeployEnv({ SITE_URL: '', BASE_PATH: '' }).site).toBe('https://example.github.io');
  });

  it('passes a project-site base path through', () => {
    expect(resolveDeployEnv({ BASE_PATH: '/debre-amin' }).base).toBe('/debre-amin');
  });

  it('passes both Pages outputs through', () => {
    expect(resolveDeployEnv({ SITE_URL: 'https://org.github.io', BASE_PATH: '/repo' })).toEqual({
      site: 'https://org.github.io',
      base: '/repo',
    });
  });

  it('produces bases the path helpers turn into clean links', () => {
    for (const env of [{}, { BASE_PATH: '' }, { BASE_PATH: '/debre-amin' }]) {
      const href = localizedPath('en', 'about', resolveDeployEnv(env).base);
      expect(href).not.toContain('//');
      expect(href.endsWith('/en/about/')).toBe(true);
    }
  });
});
