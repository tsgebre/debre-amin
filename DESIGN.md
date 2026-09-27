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
`trailingSlash: 'always'` — directory-style URLs (`/en/about/`) throughout,
the safest shape for GitHub Pages.

## Snapshot

- **Phase:** 1 (Foundation).
- **Complete:** project scaffold (Astro + TypeScript strict + vitest +
  zod), env-driven `site`/`base` config, smoke test (P1-01 passed);
  i18n core — dictionaries, `t()`, base-aware path helpers, nav map (P1-02);
  `[lang]` routing, root redirect, `BaseLayout`, self-hosted fonts (P1-03).
- **Remaining:** design system + motif (P1-04), full `SiteConfig` (P1-05),
  About/Services/Contact/Clergy pages, deploy workflow; then calendar,
  content collections, remaining pages, hardening.
- **Build/test status:** `npm test` passes (65/65); `astro check` clean;
  `npm run build` emits `/index.html`, `/en/index.html`, `/am/index.html`.
- **Open risks:**
  - Base-path link correctness on GitHub Pages.
  - Amharic authenticity — every Amharic string needs parish review.
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
