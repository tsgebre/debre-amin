import axe from 'axe-core';
import { JSDOM } from 'jsdom';

export type Violation = axe.Result;

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Runs axe-core (WCAG 2.1 A/AA rules) over a full HTML document in jsdom and
 * returns its violations. `color-contrast` is disabled: jsdom has no layout
 * or computed colors, so axe cannot measure it here. Contrast is covered
 * instead by tests/tokens.test.ts, which checks every text/background pair
 * the CSS uses (TEXT_PAIRS) against its WCAG ratio.
 */
export async function runAxe(html: string): Promise<Violation[]> {
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
  try {
    dom.window.eval(axe.source);
    const windowAxe = (dom.window as unknown as { axe: typeof axe }).axe;
    const results = await windowAxe.run(dom.window.document, {
      runOnly: { type: 'tag', values: TAGS },
      rules: { 'color-contrast': { enabled: false } },
    });
    return results.violations;
  } finally {
    dom.window.close();
  }
}

/** One line per failing node: rule id, help URL and CSS target. */
export function formatViolations(violations: Violation[]): string {
  return violations
    .flatMap((v) => v.nodes.map((n) => `${v.id} (${v.helpUrl}) → ${n.target.join(' ')}`))
    .join('\n');
}
