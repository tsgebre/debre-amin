import { todayView } from '../lib/ecal/today';

// Replaces the build-day date in every [data-today] element with the real
// current date in that element's time zone. Any failure (unknown time
// zone, missing Intl data, date outside the supported range) leaves the
// server-rendered markup untouched; this must never throw.
export function updateToday(doc: Document = document, now: Date = new Date()): void {
  try {
    const lang = doc.documentElement.lang === 'am' ? 'am' : 'en';
    for (const el of doc.querySelectorAll<HTMLElement>('[data-today]')) {
      try {
        const tz = el.dataset.tz;
        if (!tz) continue;
        const e = el.querySelector('[data-today-e]');
        const g = el.querySelector('[data-today-g]');
        if (!e || !g) continue;
        const view = todayView(now, tz, lang);
        e.textContent = view.ethiopian;
        e.setAttribute('datetime', view.isoDate);
        g.textContent = view.gregorian;
        g.setAttribute('datetime', view.isoDate);
      } catch {
        // Keep the server-rendered date for this element.
      }
    }
  } catch {
    // Keep the server-rendered markup.
  }
}

updateToday();
