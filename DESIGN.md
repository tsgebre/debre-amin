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
- zod for schema validation (site config + content collections).
- `@fontsource/noto-sans-ethiopic` + `@fontsource-variable/inter`,
  self-hosted fonts.
- No client-side framework. The language toggle is a plain `<script>` or
  pure links.

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
- Fixed feasts and the saint's 24th-of-month commemorations computed from
  the conversion module.

## Content collections

- `src/content/events/` (markdown, zod frontmatter: title/titleAm/date/type).
- `src/content/gallery/` (entries pointing at local SVG placeholders).
- Adding content = adding one file.

## Deploy

`.github/workflows/deploy.yml` using `actions/configure-pages` → build with
`SITE_URL`/`BASE_PATH` derived from the Pages environment →
`actions/upload-pages-artifact` → `actions/deploy-pages`.

`astro.config.mjs` reads `site` from `SITE_URL` (default
`https://example.github.io`) and `base` from `BASE_PATH` (default `/`) so
the same build works locally and on Pages without code changes.
`trailingSlash: 'always'` — directory-style URLs (`/en/about/`) throughout,
the safest shape for GitHub Pages.

## Snapshot

- **Phase:** 1 (Foundation) — complete; Phase 2 (calendar) next.
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
  (P1-10).
- **Remaining:** Phase 2 — calendar module, feasts/fasts, full Home page;
  Phase 3 — Giving, Events, Gallery; Phase 4 — hardening.
- **Build/test status:** `npm test` passes (218/218); `astro check` clean;
  `npm run build` emits 11 pages; verified under `BASE_PATH` `''` and
  `/debre-amin`; `npm ci` in sync.
- **Open risks:**
  - Base-path link correctness on GitHub Pages.
  - Amharic authenticity — every Amharic string needs parish review;
    `CONFIG_AM_NEEDS_REVIEW` and the i18n `AM_NEEDS_REVIEW` list both feed
    that checklist.
  - Every fact in `SiteConfig` is a placeholder — the parish must supply
    real contact info, service times, clergy names and giving details
    before launch (`placeholderFields(siteConfig)` enumerates them all).
  - The saint's annual feasts (Tahsas 24, Nehase 24 high confidence;
    Ginbot 12, Megabit 24 thinly sourced) need parish confirmation before
    Phase 2 relies on them — see `docs/research/about-claims.md`.
  - Calendar correctness — conversion module and feast table need
    RESEARCHER/STATISTICAL verification against reference dates before
    Phase 2 sign-off.
  - **Astro dependency security:** staying on Astro 5.x (`^5.18.2`)
    despite `npm audit` advisories fixed only in 7.x. Astro 6+ requires
    Node ≥22.12, breaking the Node 20+ requirement, and the advisories
    target SSR/middleware, untrusted-input rendering and image processing —
    surfaces a static, repo-authored site does not have. Mitigation: no
    SSR/adapters/user-supplied images; re-check `npm audit` in Phase 4.
- **MVP confidence:** high.
