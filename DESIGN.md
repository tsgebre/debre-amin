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
- vitest, run offline via `vitest run` — no network, no live fetches.
- zod for schema validation (site config + content collections).
- `@fontsource/noto-sans-ethiopic` + `@fontsource-variable/inter`,
  self-hosted fonts.
- No client-side framework. The language toggle is a plain `<script>` or
  pure links.

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

- `src/data/site.ts` exports one typed, zod-validated `SiteConfig` holding
  every real-world fact slot (address, phone, email, service times,
  clergy, giving handles, map link, livestream link).
- Placeholder values are literal strings beginning `TBD —`.
- A test asserts the config parses against the schema.
- (This scaffold ships a minimal slice of the config — `siteName` only —
  to prove the pattern; the full fact-slot schema is added when the pages
  that need those facts are built.)

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

## Snapshot

- **Phase:** 1 (Foundation).
- **Complete:** project scaffold (Astro + TypeScript strict + vitest +
  zod), env-driven `site`/`base` config, smoke test.
- **Remaining:** 9 pages, i18n plumbing, calendar module, content
  collections, deploy workflow, hardening pass.
- **Build/test status:** `npm test` passes (1/1); `npm run build` succeeds,
  emits `dist/index.html` (scaffold placeholder page).
- **Open risks:**
  - Base-path link correctness on GitHub Pages.
  - Amharic authenticity — every Amharic string needs parish review.
  - Calendar correctness — conversion module and feast table need
    RESEARCHER/STATISTICAL verification against reference dates before
    Phase 2 sign-off.
  - **Astro dependency security:** the latest available Astro 5.x release
    (5.18.2, the newest 5.x on npm as of this writing) carries `npm audit`
    findings rated critical (XSS via several vectors, an authorization
    bypass in base-path stripping, and an RCE report in AVIF image
    optimization) that are only fixed upstream in Astro 7.x. Flagged to
    the Architect for a decision — see task response QUESTIONS.
- **MVP confidence:** high.
