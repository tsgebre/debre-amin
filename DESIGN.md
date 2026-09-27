# DESIGN.md — Debre Amin Church Website

Official bilingual (English + Amharic) static website for Debre Amin Abune
Teklehaymanot Ethiopian Orthodox Tewahedo Church (Greensboro, NC).

## MVP boundary

Everything in Phases 1–3 (all nine pages, bilingual, calendar module, deploy
workflow) plus Phase 4 hardening. Out of scope: backends, CMS, payment
processing, livestream integration (config link slot only), auto-translated
liturgical texts.

## Stack

- Astro (static output), TypeScript strict.
- vitest 3 (matches Astro 5's Vite 6), run offline via `vitest run` — no
  network, no live fetches. `vitest.config.ts` uses Astro's `getViteConfig`
  so `.astro` components render in tests via the Container API.
- Type checking: `npm run check` (`astro check`), which covers `.astro`
  files as well as `.ts`.
- Accessibility gate: `axe-core` in `jsdom` (both devDependencies; jsdom
  pinned to 26.x, which supports the Node ≥20.3 floor — 29.x needs 20.19),
  run from `tests/a11y.test.ts` over every page type via
  `tests/helpers/pages.ts`.
- zod for schema validation (site config + content collections).
- `@astrojs/sitemap` (dependency, since it runs during the real build) for
  the i18n-aware sitemap; `sharp` (devDependency, already resolved via
  Astro so this adds no new `npm audit` findings) rasterises the
  hand-generated `og-image.png` SVG at dev time only — never at build time.
- `@fontsource/noto-sans-ethiopic` + `@fontsource-variable/inter`,
  self-hosted fonts.
- No client-side framework. The language toggle is pure links. The only
  client JS is the small "today" updater (see Client-side today).

## Design system

- `src/styles/tokens.ts` is the single source of truth for the palette
  (deep liturgical green, gold for decoration/backgrounds only, a darker
  text-safe gold, red for sparing emphasis, cream page background, ink
  body text, muted secondary text, white) and for `TEXT_PAIRS`, the
  foreground/background combinations the CSS uses for text, each with a
  minimum WCAG contrast ratio. `tests/tokens.test.ts` implements the
  WCAG relative-luminance/contrast formula, checks it against reference
  values, asserts every pair meets its ratio, and parses `global.css` to
  confirm every `--color-*` custom property matches `tokens.ts`.
- `global.css` declares the palette as `--color-*` custom properties in
  `:root` and uses only those (no hex outside that block); mobile-first
  header/nav/footer, no JS, no hamburger, nav becomes a single row at
  ≥960px, 44px tap targets, ~70ch content width, and a
  `prefers-reduced-motion` rule.
- `src/components/CrossMotif.astro` is an original inline SVG (plus-body
  with small lattice piercings at the crossing, a ring terminal at each
  arm tip), `aria-hidden`/`focusable="false"`, `fill="currentColor"`,
  used in the header and as a Home divider. `public/favicon.svg` is a
  simplified green/gold rendering of the same geometry.
- `src/components/Placeholder.astro` wraps placeholder content in a
  visible badge (`placeholder.notice`) and a `data-placeholder` marker,
  with an optional `field` prop pointing at the `site.ts` slot to fill in.

## i18n

- Locale-prefixed routes via `src/pages/[lang]/…` dynamic routes with
  `getStaticPaths()` returning `en` and `am`.
- `/` is a static redirect page to `/en/`.
- UI strings live in `src/i18n/en.json` and `src/i18n/am.json` with
  identical key sets (parity-tested).
- A `t(lang, key)` helper renders a visible `⟦missing: key⟧` marker on
  absent keys — never throws, never blank.
- The toggle links to the same path under the other locale.
- Amharic pages set `lang="am"` and use the Ethiopic font.

## Central config

- `src/data/site.ts` exports `siteConfig`, one typed, zod-validated
  `SiteConfig` holding every real-world fact slot: contact (phone, email,
  address, map link, directions), services (name/day/time/note), clergy
  (name/role/photo), giving (Zelle, PayPal, Cash App, mailing address) and
  a livestream link.
- Every field is `placeholder | validRealValue` (`src/data/placeholder.ts`
  — `PLACEHOLDER_PREFIX = 'TBD —'`, `isPlaceholder`, `ph(location)`).
  Real phone/email/URL/Cash-App-tag values are validated by regex/zod so a
  typo fails the build instead of shipping; a placeholder always passes.
  `placeholderFields(siteConfig)` returns the dotted path of every
  placeholder leaf, for a future README checklist.
- The site's display name comes from the i18n dictionaries
  (`t(lang,'site.name')`), not from `site.ts`.
- `CONFIG_AM_NEEDS_REVIEW` lists the Amharic service names that are
  correct general EOTC terms but need the parish's confirmation for this
  parish's actual schedule.
- Tests (`tests/site-config.test.ts`) assert the schema accepts real
  values and rejects malformed ones, that every expected field is flagged
  by `placeholderFields`, and — the honesty guard — that no non-placeholder
  leaf contains a phone/time-shaped digit run or an `@`, and every
  non-placeholder Amharic value is genuine Ethiopic script.

## Ethiopian calendar

- `src/lib/ecal/` — pure TS, no dependencies.
- JDN-based Ethiopian↔Gregorian conversion (12×30 + Pagume 5/6, leap when
  `year % 4 === 3`), invalid-date rejection.
- Movable feasts (Fasika and dependents): RESEARCHER-verified lookup table
  for 2016–2030 EC rather than computus — lower risk, equally testable.
  Implemented in `src/lib/feasts/` (P2-02/P2-03), which imports only from
  `src/lib/ecal`.
- Fixed feasts and the saint's 24th-of-month commemorations computed from
  the conversion module.

## Client-side today

- Pages are static, so "today" is shown in two layers. `TodayDate.astro`
  (in `BaseLayout`, a slim strip under the header on every page)
  server-renders the **build day** in both calendars. That text is readable
  without JavaScript, and its `min-height` is reserved so the update never
  shifts the layout.
- `src/scripts/today.ts` then replaces the text and the `<time datetime>`
  with the real current date via `todayView` (`src/lib/ecal/today.ts`). It
  is bundled by Astro (inlined as a ~3 KB `type="module"` script), never
  throws, and leaves the server markup untouched on any failure.
- The day is the civil day in the parish time zone, `siteConfig.timeZone =
  'America/New_York'` (a real value, validated as an IANA name).
- `deploy.yml` rebuilds daily at 06:17 UTC (just after midnight Eastern),
  so the no-JS fallback is never more than about a day stale.
- **Script policy (tested):** every `<script>` is `type="module"` and is
  either inlined or loaded from `<base>_astro/`. No external hosts.

## Content collections

- `src/content/about/` (markdown, zod frontmatter) — the EOTC and saint
  sections shown on the About page (P1-09).
- `src/content/events/` (markdown, zod frontmatter: bilingual title/summary,
  `date`/`endDate` as plain `YYYY-MM-DD` strings validated against the real
  Ethiopian↔Gregorian calendar core, `type: 'event' | 'announcement'`,
  `bodyLang`, `draft`). One file = one bilingual item; a filename starting
  with `_` (the `_TEMPLATE.md` shipped in the repo) is never published,
  regardless of its `draft` value. `src/lib/events.ts` holds the pure
  sort/filter/mapping helpers (no `astro:content` import, so tests import
  it directly). Malformed frontmatter fails the build loudly
  (`InvalidContentEntryDataError`, naming the file and field) (P3-02).
- `src/content/gallery/` (YAML, zod frontmatter: `image` under
  `images/gallery/`, required `width`/`height` to prevent layout shift,
  bilingual `alt`/optional `caption`, optional `date`/`order`,
  `placeholder`). `src/lib/gallery.ts` holds `sortGallery` and
  `missingImages` (pure, no `astro:content` import); the gallery page calls
  `missingImages` at build time and throws, naming the YAML file and the
  missing path, so a typo in a filename fails the build loudly. Ships six
  original placeholder-*.yaml entries pointing at six original,
  algorithmically generated SVGs (`scripts/generate-gallery-placeholders.mjs`
  / `npm run gallery:placeholders`, output committed) — abstract, in the
  site palette, echoing the cross motif, no photographs (P3-03).
- Adding content = adding one file.

**Astro-compiler gotcha:** a template literal nested inside another
template literal's `${...}` in a page's frontmatter (e.g. building an
error message from a `.map()` of formatted strings) makes the Astro→esbuild
pipeline misparse the *template* section that follows, failing with a
confusing `Expected ">" but found "..."` error blamed on an unrelated line.
Split into two statements (build the inner string first, assign it to a
variable, then use that variable in the outer template literal) instead of
nesting backticks. Hit and fixed in `src/pages/[lang]/gallery.astro`
(P3-03); worth remembering for any future build-time error message built
from formatted list items.

## Deploy

`.github/workflows/deploy.yml` using `actions/configure-pages` → build with
`SITE_URL`/`BASE_PATH` derived from the Pages environment →
`actions/upload-pages-artifact` → `actions/deploy-pages`.

`astro.config.mjs` reads `site` from `SITE_URL` (default
`https://example.github.io`) and `base` from `BASE_PATH` (default `/`) so
the same build works locally and on Pages without code changes.
`trailingSlash: 'always'` — directory-style URLs (`/en/about/`) throughout,
the safest shape for GitHub Pages.

## Architecture map

- `src/pages/` — routes. `[lang]/` holds the nine bilingual pages plus the
  `events/[slug]` detail route; `index.astro` (root) is the `/`→`/en/`
  redirect; `404.astro` and `robots.txt.ts` sit outside `[lang]` since
  neither is per-locale content.
- `src/layouts/BaseLayout.astro` — the one HTML shell: head metadata (SEO,
  P4-02), header/nav/footer, the `TodayDate` strip, the `<main id="main">`
  landmark every page renders into.
- `src/components/` — one presentational `.astro` component per page
  section (e.g. `ContactDetails`, `CalendarView`, `GalleryGrid`), each
  taking plain props so it can be unit-tested without its page's data
  loading.
- `src/data/` — `site.ts` (the real-world fact config, `siteConfig`),
  `placeholder.ts` (the `TBD —` convention), `links.ts` (`tel:`/`mailto:`/
  `cash.app` URL builders).
- `src/i18n/` — `en.json`/`am.json` (UI strings), `index.ts` (`t()`),
  `paths.ts` (base-aware URL helpers, `absoluteUrl`), `nav.ts`, `review.ts`
  (`AM_NEEDS_REVIEW`).
- `src/lib/ecal/` — the Ethiopian↔Gregorian calendar core (pure TS, no
  dependencies, no `astro:content`).
- `src/lib/feasts/` — fixed and movable feasts/fasts built on `ecal`.
- `src/lib/events.ts`, `src/lib/gallery.ts` — pure helpers for their
  content collections (sort/filter/map), importable directly in tests.
- `src/content/` — `about/` (markdown), `events/` (markdown), `gallery/`
  (YAML); each collection's zod schema lives in `src/content/schemas.ts`,
  wired up in `content.config.ts`. One file = one item; a `_`-prefixed
  filename is a template, never published.
- `src/styles/` — `tokens.ts` (the palette + contrast pairs, single source
  of truth) and `global.css` (uses only those tokens).
- `src/scripts/today.ts` — the one piece of client-side JavaScript.
- `scripts/` (repo root) — dev-time generators whose output is committed:
  `generate-gallery-placeholders.mjs`, `generate-og-image.mjs`. Neither
  runs during `npm run build`.
- `docs/research/` — the sourcing record: what was verified, against what,
  and how confident it is, for calendar dates, feasts and About-page facts.
- `tests/` mirrors this structure; `tests/helpers/pages.ts` renders all 28
  page types (both locales) once per test file, shared by the a11y,
  structure, mixed-language and SEO suites.

## Snapshot

- **Phase:** 4 (Hardening) — in progress; Phases 1–3 complete.
- **Complete:** project scaffold (Astro + TypeScript strict + vitest +
  zod), env-driven `site`/`base` config, smoke test (P1-01 passed);
  i18n core — dictionaries, `t()`, base-aware path helpers, nav map (P1-02);
  `[lang]` routing, root redirect, `BaseLayout`, self-hosted fonts (P1-03);
  palette + contrast-tested tokens, cross motif, responsive header/nav/
  footer, `Placeholder` component, accessible language toggle (P1-04);
  the full `SiteConfig` — every real-world fact slot as a validated
  placeholder, `placeholderFields`, honesty-guard tests (P1-05); the
  Services & Schedule page, driven by `siteConfig.services` and a new
  `Fact` component that renders any config value and auto-marks
  placeholders (P1-06); the Contact & Location page, driven by
  `siteConfig.contact` via a `ContactDetails` component, with `Fact`
  extended for `tel:`/`mailto:` links (`src/data/links.ts`) that only
  appear once real values replace the placeholders (P1-07); the Clergy &
  Leadership page, driven by `siteConfig.clergy` via `ClergyList`/
  `ClergyCard`, with a local placeholder portrait SVG and a schema that
  only accepts local `images/clergy/*` filenames for a real photo (P1-08);
  the About page — parish history as a `parish.history` placeholder, plus
  RESEARCHER-verified EOTC and saint sections in the `about` content
  collection (`src/content/about/*.md`, schema in `src/content/schemas.ts`),
  each with its sources; claims register in `docs/research/about-claims.md`
  (P1-09); GitHub Pages deploy workflow (tests gate the build), base path
  resolved by `src/config/deploy.ts` (`''` → `/` for user/org sites and
  custom domains), readable `site.ts` validation errors, volunteer README
  (P1-10); bilingual service days (P1-11); the calendar conversion core
  `src/lib/ecal/` — pure dependency-free TS, JDN-based Ethiopian↔Gregorian
  conversion with validation, `ethiopianTodayIn`, bilingual month names and
  formatting, verified by an 18-row RESEARCHER-sourced reference table
  (`docs/research/ecal-reference.md`) and an independent day-walking oracle
  over every day of 1900–2100 (P2-01); the fixed feast/fast layer
  `src/lib/feasts/` — Enkutatash, Meskel, Tsome Nebiyat (to the eve of
  Genna), Genna (Tahsas 28 in ዘመነ ዮሐንስ, else 29), Ketera, Timket, Tsome
  Filseta, Filseta, the saint's Tahsas 24 / Nehase 24 feasts and monthly
  24th commemorations, resolved for EC 1893–2092 and checked against dated
  observances (`docs/research/feasts.md`) (P2-02); movable feasts —
  `FASIKA_TABLE` (EC 2016–2030, three paschalion sources per row,
  cross-checked against a Julian-computus oracle) with Nenewe, Abiy Tsom,
  Hosanna, Siklet, Erget, Peraklitos and Tsome Hawariat as verified day
  offsets; Demera; `feastsForYear` (`movableAvailable` false outside the
  table — never guessed), `nextFeast`, `currentObservances`, and
  `confidence` on every occurrence (P2-03); site-wide `TodayDate` strip
  (build-day fallback + client update in the parish time zone, with an
  Intl-fallback guard on `am` pages), daily cron rebuild, tested script
  policy (P2-04); the Calendar & Feasts page (`CalendarView.astro` +
  `src/pages/[lang]/calendar.astro`) — the 13 months, major feasts,
  fasting periods (never a day count; Abiy Tsom shown as "until Fasika"),
  a visible pending-confirmation note on medium-confidence entries, the
  saint's two annual feasts plus the 12 monthly 24th commemorations, and a
  visible note (never a silent gap) when a year falls outside
  `FASIKA_TABLE`, both calendars shown for every fast's From/To (P2-05);
  the Home page (`HomeView.astro`) — a general welcome (no parish facts),
  a services summary via `Fact` linking to the Services page, the next
  feast via `nextFeast` (with a "Today" label when it falls today), any
  fast in progress via `currentObservances` (rendered only when non-empty;
  Abiy Tsom shown as "until Fasika"), the saint's next monthly
  commemoration via `nextFeast({kinds:['commemoration']})`, and a latest-
  announcements section with an honest empty state and an `announcements`
  prop ready for Phase 3's events collection (P2-06). **Phase 2 complete.**
  the Giving page (`GivingDetails.astro` + `src/pages/[lang]/giving.astro`)
  — Zelle shown as copyable text (never a link), PayPal and Cash App as
  `Fact as="link"` (`cashAppHref` in `src/data/links.ts` builds the
  `cash.app/$tag` URL), the mailing address in `<address>`, no payment
  processed on the site, and no tax/deductibility claim — that's a
  real-world fact this project doesn't have (P3-01); Events & Announcements
  — the `events` content collection (see Content collections above), a
  newest-first list page and a detail page per item in both locales,
  dates always shown in both calendars, a friendly empty state, and the
  latest items wired into Home via `toAnnouncementItems`. No real events
  ship — only the template and an honest empty state (P3-02); the Gallery
  (`GalleryGrid.astro` + `src/pages/[lang]/gallery.astro`) — a responsive
  2/3/4-column grid, `width`/`height` on every `<img>`, a full-size link
  with an accessible name, the `Placeholder` badge on placeholder entries,
  both-calendar dates when present, an honest empty state, and a build-time
  check that fails loudly on any missing image file. Ships six original,
  locally generated abstract SVG placeholders — no photographs, no
  hotlinking (P3-03). **Phase 3 complete.** Accessibility audit (P4-01):
  axe-core (WCAG 2.1 A/AA, contrast via `tokens.test.ts`) over all 28 page
  renders in both locales, a heading/landmark/element structure test, a
  mixed-language test (English fragments on Amharic pages carry
  `lang="en"`, via `MixedText` and explicit spans on real config values),
  a bilingual `404.astro`, a fixed skip-link focus ring (was 1.47:1 on the
  header band, now gold 4.03:1), cadence wording removed, and placeholder
  gallery images no longer linked. SEO (P4-02): every page carries a
  localised `meta.<page>.description` (event detail uses `summary[lang]`),
  an absolute canonical URL (`absoluteUrl` in `src/i18n/paths.ts`), `en`/
  `am`/`x-default` hreflang alternates, and the full Open Graph + Twitter
  set (`og:image` is the committed `public/og-image.png`, 1200×630,
  generated by `scripts/generate-og-image.mjs` — the cross motif, palette
  and parish name in both languages, verified by visual inspection that
  the Ethiopic glyphs render). The root redirect and `404` stay `noindex`
  with no alternates. `@astrojs/sitemap` emits an i18n-aware
  `sitemap-index.xml` (18 localised URLs, `xhtml:link` alternates,
  excluding the redirect and 404), and `src/pages/robots.txt.ts` points at
  it, both base-path aware. Normalised the Amharic spelling of "schedule"
  to መርሐ ግብር throughout. README polish (P4-03): the README is now the
  definitive volunteer/maintainer guide — step-by-step sections for adding
  an event, a gallery photo and a clergy photo, a consolidated Placeholder
  checklist (every path from `placeholderFields(siteConfig)`), a "what
  still needs parish review" section naming all four `*_AM_NEEDS_REVIEW`
  lists plus the medium-confidence feasts and the research-candidate
  feasts, Maintenance (the `FASIKA_TABLE` 2038 horizon, the 1900–2100
  calendar range, dependency updates) and Troubleshooting sections, and a
  re-checked, per-advisory `npm audit` table. `tests/readme.test.ts` keeps
  it synchronised: required headings, every placeholder path, every
  `*_AM_NEEDS_REVIEW` export name, every `npm run` script and every
  `src/`/`public/`/`docs/`/`scripts/`/`.github/` path it names for real.
  **All four phases complete.**
- **Remaining:** P4-04, the final verification sweep.
- **Build/test status:** `npm test` passes (1376/1376); `astro check`
  clean; `npm run build` emits 20 pages (incl. `404.html`, `robots.txt`,
  `sitemap-index.xml`) with the shipped (empty) events collection and the
  six shipped gallery placeholders; verified under `BASE_PATH` `''` and
  `/debre-amin`; `npm ci` in sync.
- **`npm audit` (re-checked P4-03; already latest 5.x — `npm view astro@5
  version` tops out at 5.18.2, which is what's installed):**
  | Package | Severity | Summary | Applies to this site? |
  |---|---|---|---|
  | astro (+ esbuild) | critical (+moderate) | Multiple XSS/RCE/SSRF/authz advisories, fixed only in Astro 7 | No — every vector needs SSR/server islands, `client:*`/view-transition directives, or `astro:assets` image processing; this site is `output: 'static'`, no adapter, no client directives, no Astro image pipeline. Astro 7 also needs Node ≥22.12 (we support ≥20.3). esbuild's advisory is Windows-dev-server-only; CI is Ubuntu. |
  | sharp | high | `libvips`/`libheif` memory-safety CVEs | No — sharp runs only offline, by hand, via `npm run gallery:placeholders` / `npm run og:image`, never during `npm run build`, and only on images this repo authors itself. |
  | @vitest/mocker | moderate | Path traversal via a mocker redirect, fixed in vitest 5 | No — dev/test-only; never in `dist/`. All mocks in this repo are first-party test code. Upgrading now would risk breaking every test's use of Astro 5's Container API. |

  Total: 5 vulnerabilities (1 low, 2 moderate, 1 high, 1 critical) — same
  count as every prior check; no upgrade taken. Full per-advisory reasoning
  is also in the README's Known limitations section.
- **Open risks (each with its mitigation):**
  - **Base-path link correctness on GitHub Pages.** Mitigation: every
    internal link, asset path, canonical/hreflang/OG URL and the sitemap/
    `robots.txt` go through `src/i18n/paths.ts` helpers, tested under both
    `BASE_PATH ''` and `/debre-amin` in every relevant test file and in
    real `npm run build` runs (see each phase's TESTER evidence).
  - **Amharic authenticity.** Mitigation: every Amharic string is either
    genuine Ethiopic (enforced by tests) or explicitly flagged in one of
    four review lists (`AM_NEEDS_REVIEW`, `CONFIG_AM_NEEDS_REVIEW`,
    `ECAL_AM_NEEDS_REVIEW`, `GALLERY_AM_NEEDS_REVIEW`) plus
    `amReviewPending` on the About content — all four are now listed by
    name in the README's "What still needs parish review".
  - **Every fact in `SiteConfig` is a placeholder.** Mitigation: the
    parish must supply real contact info, service times, clergy names,
    giving details and parish history before launch;
    `placeholderFields(siteConfig)` enumerates them all, and the README's
    Placeholder checklist is kept in sync with that function by
    `tests/readme.test.ts` (a mutation-tested guarantee, not just a
    convention).
  - **The saint's annual feasts.** Tahsas 24 and Nehase 24 are high
    confidence and shipped; Ginbot 12 and Megabit 24 are single-sourced
    and deliberately not shipped. Mitigation: named in
    `docs/research/about-claims.md` and in the README.
  - **Calendar correctness.** The conversion core is RESEARCHER-verified
    (`docs/research/ecal-reference.md`) and oracle-tested over the full
    supported range, 1900–2100; fixed feasts are verified
    (`docs/research/feasts.md`). Tsome Nebiyat's and Tsome Hawariat's end
    dates are medium confidence and show a visible pending-confirmation
    note; their lengths are never displayed. Mitigation: both are named in
    the README, with their sources.
  - **`FASIKA_TABLE`'s 2038 horizon.** Movable feasts are verified only
    for EC 2016–2030 (Gregorian 2024–2038); outside that the Calendar page
    shows a visible "not yet available" note rather than guessing.
    Mitigation: the README's Maintenance section explains exactly how and
    when to extend the table, with the same verification standard used to
    build it.
  - **Astro dependency security.** See the `npm audit` table above;
    mitigation is unchanged (no SSR/adapters/user-supplied images/image
    pipeline), now with a fuller per-advisory record in both this file and
    the README.
- **MVP confidence:** high.
