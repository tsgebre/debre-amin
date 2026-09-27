import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface Step {
  name?: string;
  id?: string;
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
  env?: Record<string, string>;
}

const wf = parse(readFileSync(resolve(__dirname, '../.github/workflows/deploy.yml'), 'utf-8'));
const buildSteps: Step[] = wf.jobs.build.steps;
const deploy = wf.jobs.deploy;

function indexOf(pred: (s: Step) => boolean, what: string): number {
  const i = buildSteps.findIndex(pred);
  expect(i, `build step not found: ${what}`).toBeGreaterThanOrEqual(0);
  return i;
}

describe('deploy workflow', () => {
  it('runs on push to main and on manual dispatch', () => {
    expect(wf.on.push.branches).toEqual(['main']);
    expect(wf.on).toHaveProperty('workflow_dispatch');
  });

  it('rebuilds daily at 06:17 UTC (just after midnight US Eastern)', () => {
    expect(wf.on.schedule).toEqual([{ cron: '17 6 * * *' }]);
  });

  it('grants exactly the Pages permissions', () => {
    expect(wf.permissions).toEqual({ contents: 'read', pages: 'write', 'id-token': 'write' });
  });

  it('serialises deploys without cancelling one in progress', () => {
    expect(wf.concurrency).toEqual({ group: 'pages', 'cancel-in-progress': false });
  });

  it('runs the build steps in order, with tests gating the build', () => {
    expect(wf.jobs.build['runs-on']).toBe('ubuntu-latest');
    const checkout = indexOf((s) => s.uses === 'actions/checkout@v4', 'checkout');
    const node = indexOf((s) => s.uses === 'actions/setup-node@v4', 'setup-node');
    const pages = indexOf((s) => s.uses === 'actions/configure-pages@v5', 'configure-pages');
    const ci = indexOf((s) => s.run === 'npm ci', 'npm ci');
    const test = indexOf((s) => s.run === 'npm test', 'npm test');
    const build = indexOf((s) => s.run === 'npm run build', 'npm run build');
    const checkLinks = indexOf((s) => s.run === 'npm run check:links', 'npm run check:links');
    const upload = indexOf((s) => s.uses === 'actions/upload-pages-artifact@v3', 'upload');
    expect([checkout, node, pages, ci, test, build, checkLinks, upload]).toEqual(
      [checkout, node, pages, ci, test, build, checkLinks, upload].slice().sort((a, b) => a - b),
    );
    expect(test).toBeLessThan(build);
    expect(build).toBeLessThan(checkLinks);
    expect(checkLinks).toBeLessThan(upload);

    expect(buildSteps[node].with).toMatchObject({ 'node-version': 20, cache: 'npm' });
    expect(buildSteps[pages].id).toBe('pages');
  });

  it('feeds the Pages outputs into the build', () => {
    const build = buildSteps.find((s) => s.run === 'npm run build')!;
    expect(build.env).toEqual({
      SITE_URL: '${{ steps.pages.outputs.origin }}',
      BASE_PATH: '${{ steps.pages.outputs.base_path }}',
    });
  });

  it('checks links with the same Pages outputs as the build, after building', () => {
    const checkLinks = buildSteps.find((s) => s.run === 'npm run check:links')!;
    expect(checkLinks.env).toEqual({
      SITE_URL: '${{ steps.pages.outputs.origin }}',
      BASE_PATH: '${{ steps.pages.outputs.base_path }}',
    });
  });

  it('uploads dist as the Pages artifact', () => {
    const upload = buildSteps.find((s) => s.uses === 'actions/upload-pages-artifact@v3')!;
    expect(upload.with).toEqual({ path: 'dist' });
  });

  it('deploys after build into the github-pages environment', () => {
    expect(deploy.needs).toBe('build');
    expect(deploy.environment).toEqual({
      name: 'github-pages',
      url: '${{ steps.deployment.outputs.page_url }}',
    });
    const step = (deploy.steps as Step[]).find((s) => s.uses === 'actions/deploy-pages@v4');
    expect(step?.id).toBe('deployment');
  });

  it('pins every action to a major-version tag', () => {
    const uses = Object.values(wf.jobs as Record<string, { steps: Step[] }>)
      .flatMap((job) => job.steps)
      .map((s) => s.uses)
      .filter((u): u is string => Boolean(u));
    expect(uses.length).toBeGreaterThan(0);
    for (const u of uses) expect(u, u).toMatch(/^[\w.-]+\/[\w.-]+@v\d+$/);
  });
});
