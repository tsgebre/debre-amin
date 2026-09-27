// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Server markup as rendered on a stale build day (2026-09-20, EC Meskerem 10, 2019).
function staleMarkup(lang: 'en' | 'am', tz: string): void {
  document.documentElement.lang = lang;
  document.body.innerHTML = `
    <p class="today-date" data-today data-tz="${tz}">
      <span class="today-label">Label:</span>
      <time datetime="2026-09-20" data-today-e>STALE-E</time>
      <span aria-hidden="true">·</span>
      <time datetime="2026-09-20" data-today-g>STALE-G</time>
    </p>`;
}

const eEl = () => document.querySelector('[data-today-e]')!;
const gEl = () => document.querySelector('[data-today-g]')!;

async function runScript(): Promise<void> {
  vi.resetModules();
  await import('../src/scripts/today');
}

describe('client-side today script', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-27T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('replaces the stale build date with the current date, in Amharic', async () => {
    staleMarkup('am', 'America/New_York');
    await runScript();
    expect(eEl().textContent).toBe('መስከረም 17 ቀን 2019 ዓ.ም.');
    expect(gEl().textContent).toBe('27 ሴፕቴምበር 2026');
    expect(eEl().getAttribute('datetime')).toBe('2026-09-27');
    expect(gEl().getAttribute('datetime')).toBe('2026-09-27');
  });

  it('uses English when <html lang="en">', async () => {
    staleMarkup('en', 'America/New_York');
    await runScript();
    expect(eEl().textContent).toBe('Meskerem 17, 2019 E.C.');
    expect(gEl().textContent).toBe('September 27, 2026');
  });

  it('uses the element’s time zone for the civil day', async () => {
    vi.setSystemTime(new Date('2026-09-11T03:30:00Z'));
    staleMarkup('en', 'America/New_York');
    await runScript();
    expect(eEl().textContent).toBe('Pagume 5, 2018 E.C.');
    expect(eEl().getAttribute('datetime')).toBe('2026-09-10');
  });

  it('leaves the markup unchanged and throws nothing for a bogus time zone', async () => {
    staleMarkup('am', 'Mars/Olympus');
    const before = document.body.innerHTML;
    await expect(runScript()).resolves.toBeUndefined();
    expect(document.body.innerHTML).toBe(before);
  });

  it('leaves the markup unchanged when data-tz is missing', async () => {
    staleMarkup('en', 'America/New_York');
    document.querySelector('[data-today]')!.removeAttribute('data-tz');
    const before = document.body.innerHTML;
    await runScript();
    expect(document.body.innerHTML).toBe(before);
  });

  it('does nothing on a page without the element', async () => {
    document.body.innerHTML = '<main>no date here</main>';
    await expect(runScript()).resolves.toBeUndefined();
    expect(document.body.innerHTML).toBe('<main>no date here</main>');
  });
});
