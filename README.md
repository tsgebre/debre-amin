# Debre Amin Abune Teklehaymanot — Church Website

The official bilingual (English and Amharic) website of Debre Amin Abune
Teklehaymanot Ethiopian Orthodox Tewahedo Church, Greensboro, North Carolina.

It is a static website: plain pages with no database and no server code. It
is hosted free on GitHub Pages. Most of the parish's real details (phone,
service times, clergy names and so on) are **not filled in yet**. They
appear on the site as clearly marked placeholders until the parish replaces
them. This guide shows you how.

---

## Quick start

You need **Node.js version 20 or newer** (download it from the official Node.js website). Then,
in a terminal, inside this folder:

| Command | What it does |
|---|---|
| `npm install` | Downloads the tools the site needs. Run it once, and again after updating. |
| `npm run dev` | Starts a local preview at the address it prints (usually `http://localhost:4321`). It reloads as you edit. Press `Ctrl+C` to stop. |
| `npm test` | Runs the automatic checks: translations, placeholders, links, colours and more. |
| `npm run build` | Builds the finished website into the `dist/` folder. |
| `npm run preview` | Shows the finished `dist/` build locally, exactly as it will look online. |
| `npm run check` | Checks the code for type errors (optional; the website workflow doesn't need it). |

If `npm test` and `npm run build` both finish without errors, your change is
safe to publish.

---

## Replacing placeholder content

### The one rule

**Anything that starts with `TBD —` is a placeholder.** On the website it is
shown with a gold "Placeholder — the parish will replace this" badge and the
words "To be announced". Nothing else on the site invents facts about the
parish.

In the code, placeholders usually look like `ph('contact.phone')` or
`bilingualPh('contact.directions')`. To fill one in, replace that whole
expression with the real value, in quotes.

### Where the facts live: `src/data/site.ts`

Every real-world fact about the parish is in **one file**:
`src/data/site.ts`, near the bottom, inside `const config = { … }`.

The file checks every value you enter. If a value has the wrong format, the
build stops and tells you exactly which field is wrong and what it expects.
For example, a phone number without the country code and a web link that
starts with `http://` produce:

```text
src/data/site.ts has invalid values:
  - contact.phone: phone must be +1 followed by 10 digits (spaces, dashes, parentheses allowed)
  - livestreamUrl: URL must be absolute and https://
(Any of these may instead be a placeholder starting with "TBD —".)
```

Fix the value and run `npm run build` again.

The examples below use made-up values (555-01xx numbers and `example.org`
addresses are reserved for examples). Use the parish's real details.

#### Contact (shown on the Contact page)

| Field | Accepted format | Example |
|---|---|---|
| `contact.phone` | `+1` followed by 10 digits; spaces, dashes and parentheses are fine | `'+1 (336) 555-0100'` |
| `contact.email` | a normal email address | `'office@example.org'` |
| `contact.address.street` | any text | `'123 Example Road'` |
| `contact.address.postalCode` | 5-digit ZIP, or ZIP+4 | `'27401'` or `'27401-1234'` |
| `contact.mapUrl` | a full web link starting with `https://` | `'https://maps.example.org/…'` |
| `contact.directions` | text in both languages | `{ en: 'Parking is behind the hall.', am: '…' }` |

City (`Greensboro`), state (`NC`) and country (`USA`) are already filled in.
Once real, the phone number and email become tappable links automatically.
The map is shown as a link only; nothing is embedded and no API key is
needed.

#### Services (shown on the Services page)

Each service has a `name` (already filled in), a `day` and a `time`.

| Field | Accepted format | Example |
|---|---|---|
| `services.N.day` | any text | `'Sunday'` |
| `services.N.time` | hour:minutes followed by AM or PM | `'9:00 AM'` |

`N` is the service's position in the list, starting at 0.

Note: `day` and `time` are currently single values shown on **both** the
English and the Amharic pages.

#### Clergy (shown on the Clergy page)

Each person has a `name` and a `role`, each in both languages
(`{ en: '…', am: '…' }`), and an optional `photo`.

To add a photo:

1. Save the photo in `public/images/clergy/`. Use a **lowercase name with
   hyphens** and a `.jpg`, `.jpeg`, `.png` or `.webp` ending, for example
   `abba-example.jpg`. Spaces, capital letters and web links are rejected.
2. Add `photo: 'images/clergy/abba-example.jpg'` to that person in
   `site.ts`.

Until a photo is added, a neutral silhouette is shown. Only use photos the
parish has permission to publish. To remove the clergy list entirely, empty
the list (`clergy: []`); the page then shows a friendly "coming soon" message.

#### Giving (stored now; the Giving page arrives in Phase 3)

| Field | Accepted format | Example |
|---|---|---|
| `giving.zelle` | a `+1` phone number or an email address | `'giving@example.org'` |
| `giving.paypalUrl` | a web link starting with `https://` | `'https://www.example.org/give'` |
| `giving.cashAppTag` | `$` followed by 1–20 letters, digits, `_` or `-` | `'$ExampleParish'` |
| `giving.mailingAddress` | any text | `'PO Box …'` |

#### Livestream (shown on the Services page)

`livestreamUrl`: a web link starting with `https://`.

#### Parish history (shown at the top of the About page)

`parish.history`: text in both languages, `{ en: '…', am: '…' }`.

### Wording on the site: `src/i18n/en.json` and `src/i18n/am.json`

Headings, menu labels and short texts live in two files: `en.json` for English
and `am.json` for Amharic. Each line is `"key": "text"`. Change only the text
on the right.

- **Both files must contain exactly the same keys.** The tests fail if a key
  is missing from one of them.
- Amharic text must be written in Ethiopic script.
- If a key is ever missing, the site shows `⟦missing: key⟧` instead of a blank
  space, so the gap is easy to spot.

### The About page texts: `src/content/about/`

The sections about the Ethiopian Orthodox Tewahedo Church and about Abune
Tekle Haymanot are ordinary text files: `eotc.en.md`, `eotc.am.md`,
`saint.en.md` and `saint.am.md`. The text below the second `---` line is the
page text.

- Every statement in them was checked against published sources. The sources
  are listed at the top of each file and shown on the page. The checking is
  recorded in `docs/research/about-claims.md`. If you add a new fact, add its
  source too.
- After the parish has reviewed an Amharic file, change
  `amReviewPending: true` to `amReviewPending: false`. The "translation is
  pending parish review" note then disappears from that section.
- Every section must exist in both languages. If one is missing, or the
  settings at the top of a file are wrong, the build stops with an error that
  names the file.

---

## Deploying to GitHub Pages

The repository includes a ready-made publishing workflow
(`.github/workflows/deploy.yml`). Every time you push to the `main` branch it:

1. installs the tools;
2. **runs all the tests** (if any test fails, nothing is published);
3. builds the site; and
4. publishes it to GitHub Pages.

### One-time setup

1. Create a repository on GitHub, for example `<your-org>/<your-repo>`.
2. Push this project to its `main` branch.
3. On GitHub, open the repository's **Settings → Pages**. Under **Build and
   deployment → Source**, choose **GitHub Actions**.
4. Open the **Actions** tab to watch the "Deploy to GitHub Pages" run. A green
   tick means it has been published.
5. The site's address is shown in **Settings → Pages**, and also on the
   finished run. For a normal project repository it looks like
   `https://<your-org>.github.io/<your-repo>/`. The home address sends
   visitors to the English site (`…/en/`); Amharic is at `…/am/`.

You can also start a publish by hand: **Actions → Deploy to GitHub Pages →
Run workflow**.

The site works whether it is published at the root of a domain or under a
`/<your-repo>/` sub-folder. The workflow tells the build which one to use, so
no code changes are needed.

### Using the parish's own domain (optional)

1. Create a file named `CNAME` (no file extension) in the `public/` folder,
   containing only the domain, for example `www.example.org`.
2. In **Settings → Pages → Custom domain**, enter the same domain and save.
3. At your domain registrar, point the domain to GitHub Pages as described in
   GitHub's "Managing a custom domain for your GitHub Pages site" guide. Then
   tick **Enforce HTTPS** once it becomes available.

No code change is needed: with a custom domain, the site is automatically
built for the root of the domain.

---

## What still needs parish review

- **Every placeholder.** Anything shown with the gold "Placeholder" badge,
  that is, every `TBD —` value in `src/data/site.ts`: contact details,
  service days and times, clergy names, roles and photos, giving details,
  livestream link and parish history.
- **Amharic translations.** Keys listed in `AM_NEEDS_REVIEW`
  (`src/i18n/review.ts`) and `CONFIG_AM_NEEDS_REVIEW` (`src/data/site.ts`),
  and both Amharic About files (`amReviewPending: true`).
- **The saint's annual feast dates.** Listed with their sources and confidence
  levels in `docs/research/about-claims.md`. Tahsas 24 and Nehase 24 are well
  sourced; Ginbot 12 and Megabit 24 need the parish's confirmation before the
  calendar (Phase 2) uses them.

---

## Known limitations

- **Security advisories from `npm audit`.** The site is built with Astro 5.
  `npm audit` reports advisories that are fixed only in Astro 7. The project
  stays on Astro 5 for two reasons:
  - Astro 6 and later require Node 22.12, while this project supports Node 20.
  - The advisories concern server features, rendering of visitor-supplied
    content, and image processing of uploaded files. This site has none of
    those: it is static pages built from files in this repository, with no
    server, no user input and no uploads.

  Keep it that way: don't add server rendering, adapters or user-uploaded
  images. The advisories will be re-checked in Phase 4.
- **The Home page is interim.** It shows the parish name and tagline; the
  full Home page arrives with the calendar in Phase 2.
- **Service days and times are single values** shared by both languages (see
  above).

---

## Future work (not yet built)

- **Phase 2 — Calendar:** Ethiopian ↔ Gregorian date conversion, feasts and
  fasts, and the saint's commemorations on the 24th of each month; plus the
  full Home page.
- **Phase 3 — Giving, Events & Announcements, Gallery:** pages driven by the
  giving details above and by simple one-file-per-item content folders.
- **Phase 4 — Hardening:** accessibility and link audits, a performance
  pass, a re-check of `npm audit`, and a polished version of this guide.
