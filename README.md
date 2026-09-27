# Debre Amin Abune Teklehaymanot — Church Website

The official bilingual (English and Amharic) website of Debre Amin Abune
Teklehaymanot Ethiopian Orthodox Tewahedo Church, Greensboro, North Carolina.

It is a static website: plain pages with no database and no server code. It
is hosted free on GitHub Pages. Most of the parish's real details (phone,
service times, clergy names and so on) are **not filled in yet**. They
appear on the site as clearly marked placeholders until the parish replaces
them. This guide shows you how — and how to add events, photos and other
content once the site is live.

This guide assumes no programming background beyond following numbered
steps in a text editor and a terminal.

---

## Quick start

You need **Node.js version 20 or newer** (download it from the official Node.js website). Then,
in a terminal, inside this folder:

| Command | What it does |
|---|---|
| `npm install` | Downloads the tools the site needs. Run it once, and again after updating. |
| `npm run dev` | Starts a local preview at the address it prints (usually `http://localhost:4321`). It reloads as you edit. Press `Ctrl+C` to stop. |
| `npm test` | Runs the automatic checks: translations, placeholders, accessibility, links, colours and more. |
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

#### Services (shown on the Services page, and summarised on Home)

Each service has a `name` (already filled in), a `day` and a `time`.

| Field | Accepted format | Example |
|---|---|---|
| `services.N.day` | text in both languages | `{ en: 'Sunday', am: 'እሑድ' }` |
| `services.N.time` | hour:minutes followed by AM or PM | `'9:00 AM'` |

`N` is the service's position in the list, starting at 0.

#### Clergy names and roles (shown on the Clergy page)

Each person has a `name` and a `role`, each in both languages,
`{ en: '…', am: '…' }`. See **Adding clergy photos** below for the photo
itself.

#### Giving (shown on the Giving page)

| Field | Accepted format | Example |
|---|---|---|
| `giving.zelle` | a `+1` phone number or an email address | `'giving@example.org'` |
| `giving.paypalUrl` | a web link starting with `https://` | `'https://www.example.org/give'` |
| `giving.cashAppTag` | `$` followed by 1–20 letters, digits, `_` or `-` | `'$ExampleParish'` |
| `giving.mailingAddress` | any text | `'PO Box …'` |

The Giving page never processes a payment itself: each real value becomes a
plain link to that service's own app or website, or (for Zelle) shown as
text to enter in your own banking app.

#### Livestream (shown on the Services page)

`livestreamUrl`: a web link starting with `https://`.

#### Parish history (shown at the top of the About page)

`parish.history`: text in both languages, `{ en: '…', am: '…' }`.

### Placeholder checklist

Every one of these paths is inside `const config = { … }` in
`src/data/site.ts`. This is the complete list — `npm test` fails if any of
them stops being a placeholder-or-valid-value, and a dedicated test fails if
a real one ever looks like a stray phone number or email left in the wrong
field.

| Field path | Page |
|---|---|
| `contact.phone` | Contact |
| `contact.email` | Contact |
| `contact.address.street` | Contact |
| `contact.address.postalCode` | Contact |
| `contact.mapUrl` | Contact |
| `contact.directions.en` | Contact |
| `contact.directions.am` | Contact |
| `services.N.day.en` | Services (Home) |
| `services.N.day.am` | Services (Home) |
| `services.N.time` | Services (Home) |
| `clergy.N.name.en` | Clergy |
| `clergy.N.name.am` | Clergy |
| `clergy.N.role.en` | Clergy |
| `clergy.N.role.am` | Clergy |
| `giving.zelle` | Giving |
| `giving.paypalUrl` | Giving |
| `giving.cashAppTag` | Giving |
| `giving.mailingAddress` | Giving |
| `livestreamUrl` | Services |
| `parish.history.en` | About |
| `parish.history.am` | About |

`N` stands for a service's or a clergy member's position in its list (0, 1,
2, …) — there are 3 services and 3 clergy slots by default, and you can add
or remove entries in `site.ts`.

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

## Adding an announcement or event

Events and announcements are one file each, under `src/content/events/`. A
file that starts with an underscore (`_`) is never published — that's how
the template stays out of the live site.

1. **Copy the template.** Duplicate `src/content/events/_TEMPLATE.md` in the
   same folder, and rename the copy **without** the leading underscore —
   for example, `2027-01-15-parish-picnic.md`. The filename itself doesn't
   appear anywhere on the site; pick anything that helps you find it later.
2. **Fill in each field** at the top of the file, between the two `---`
   lines:
   - `type`: `event` (something happening at a place and time) or
     `announcement` (a notice with no specific venue).
   - `title` and `summary`: both required, and both languages required.
     The summary is also what search engines and shared links show.
   - `date`: the date, written as `YYYY-MM-DD` (four-digit year, two-digit
     month, two-digit day), for example `2027-01-15` for January 15, 2027.
     It must be a real calendar date — `2027-02-30` is rejected.
   - `endDate` (optional): only for something spanning more than one day;
     same format, and it must not be before `date`.
   - `time`, `location` (both optional; `location` needs both languages if
     you use it at all).
   - `bodyLang`: which language the paragraph below the second `---` is
     written in, `en` or `am` (defaults to `en` if you leave it out). The
     page in the *other* language then shows a small note ("Details
     available in English" or its Amharic equivalent) instead of trying to
     translate it for you.
   - `draft`: keep this `true` while you're still working on the entry —
     it won't appear on the site. Set it to `false` when it's ready to go
     live.
3. **Preview it.** Run `npm run dev`, and open the Events & Announcements
   page in both languages to check it reads correctly and the dates look
   right.
4. **Commit and push** to the `main` branch. The site rebuilds and publishes
   automatically (see **Deploying to GitHub Pages** below).

### Worked example (fictional)

A complete, ready-to-publish file — copy this shape and replace every value:

```markdown
---
type: event
title:
  en: 'Example: Annual Parish Picnic'
  am: 'ምሳሌ፦ ዓመታዊ የደብር ፒክኒክ'
summary:
  en: 'Example: Join us after Divine Liturgy for food, games and fellowship.'
  am: 'ምሳሌ፦ ከቅዳሴ በኋላ ለምግብ፣ ለጨዋታ እና ለኅብረት ይቀላቀሉን።'
date: '2027-06-12'
time: '1:00 PM'
location:
  en: 'Example: Fellowship Hall'
  am: 'ምሳሌ፦ የኅብረት አዳራሽ'
bodyLang: en
draft: false
---

Example: Bring a dish to share if you can. Children's games start at 2:00 PM.
```

Save this as `2027-06-12-parish-picnic.md` in `src/content/events/`.

---

## Adding a photo to the gallery

A gallery photo is one image file plus one small text file describing it, in
`src/content/gallery/`. As with events, a filename starting with an
underscore is never published.

1. **Add the image.** Save it in `public/images/gallery/`, with a
   **lowercase name using hyphens**, ending in `.jpg`, `.jpeg`, `.png`,
   `.webp` or `.svg` — for example, `parish-picnic-2027.jpg`. Spaces,
   capital letters and web links are rejected.
2. **Find its width and height, in pixels.** On Windows, right-click the
   file → **Properties** → **Details**. On a Mac, right-click → **Get
   Info** → **More Info**. Most photo and image-viewer apps show the same
   two numbers somewhere in an "info" or "details" panel. You'll need both.
   They're required so the browser can reserve the right amount of space
   for the photo *before* it finishes loading — without them, the page
   would jump around as each photo pops in.
3. **Copy the template.** Duplicate `src/content/gallery/_TEMPLATE.yaml`
   in the same folder and rename the copy without the leading underscore,
   for example `parish-picnic-2027.yaml`.
4. **Fill in the fields:**
   - `image`: the path from step 1, e.g. `images/gallery/parish-picnic-2027.jpg`.
   - `width` and `height`: the numbers from step 2.
   - `alt`: describes what the photo shows, in both languages, for people
     using a screen reader. Don't start it with "photo of" — that's already
     implied.
   - `caption`, `date`, `order` are all optional (see the comments in the
     template for what each does).
   - `placeholder`: leave this `false` (or leave it out) for a real photo.
5. **Preview and publish** the same way as an event: `npm run dev` to check
   it, then commit and push.

**A wrong filename fails the build, on purpose**, rather than shipping a
broken image. If `parish-picnic-2027.yaml` pointed at a file that isn't
actually in `public/images/gallery/`, `npm run build` stops with:

```text
Gallery: missing image file(s) for "parish-picnic-2027.yaml" -> public/images/gallery/parish-picnic-2027.jpg. Add the file, or fix the path in that YAML entry.
```

Add the missing file, or fix the typo in the `.yaml` file, and build again.

### Removing the six placeholder photos

The gallery ships with six abstract, computer-generated placeholder images
(no photographs of anyone) so the page isn't empty before real photos exist.
Once the parish has real photos to show, delete:

- the six `placeholder-1.yaml` … `placeholder-6.yaml` files in
  `src/content/gallery/`, and
- the matching `placeholder-1.svg` … `placeholder-6.svg` files in
  `public/images/gallery/`, if you don't want to keep them around.

If you remove all of them and haven't added any real photos yet, the page
shows a friendly "no photos yet" message instead of an empty grid.

---

## Adding clergy photos

Clergy **names and roles** are placeholders in `src/data/site.ts`, listed in
the checklist above. A **photo** is different: it's optional, and there's
nothing to fill in until you add one.

1. Save the photo in `public/images/clergy/`. Use a **lowercase name with
   hyphens** and a `.jpg`, `.jpeg`, `.png` or `.webp` ending, for example
   `abba-example.jpg`. Spaces, capital letters and web links are rejected.
2. Open `src/data/site.ts` and add `photo: 'images/clergy/abba-example.jpg'`
   to that person's entry.
3. Preview with `npm run dev`, then commit and push.

Until a photo is added, a neutral silhouette is shown — never a photo of
someone else, and never a placeholder badge (a missing photo isn't treated
as a wrong or unverified fact, just an optional one). Only use photos the
parish has permission to publish. To remove the clergy list entirely, empty
the list (`clergy: []`); the page then shows a friendly "coming soon"
message.

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

The workflow also rebuilds the site automatically **every day at 06:17 UTC**
(just after midnight in Greensboro). This keeps the "Today" date at the top
of every page current even for visitors whose browsers don't run scripts;
for everyone else, the browser updates it immediately. You don't need to do
anything for this. Note that GitHub disables scheduled workflows in public
repositories after 60 days without activity; if the date ever looks stale,
re-enable the workflow on the **Actions** tab, or push any change (adding an
event or photo counts).

The site works whether it is published at the root of a domain or under a
`/<your-repo>/` sub-folder. The workflow tells the build which one to use, so
no code changes are needed. This also drives the site's sitemap, `robots.txt`
and social-preview links, so they always point at the right address.

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

- **Every placeholder.** Anything shown with the gold "Placeholder" badge —
  see the **Placeholder checklist** above.
- **Amharic wording that's correct in general but not yet confirmed for this
  parish**, tracked in four lists, each next to the text it covers:
  - `AM_NEEDS_REVIEW` in `src/i18n/review.ts` — site-wide wording (menus,
    page intros, button labels, and so on).
  - `CONFIG_AM_NEEDS_REVIEW` in `src/data/site.ts` — the Amharic service
    names.
  - `ECAL_AM_NEEDS_REVIEW` in `src/lib/ecal/names.ts` — Ethiopian month-name
    spelling variants and date-formatting conventions.
  - `GALLERY_AM_NEEDS_REVIEW` in `src/content/schemas.ts` — the Amharic
    captions on the six placeholder gallery images.
- **The Amharic About page text.** `src/content/about/eotc.am.md` and
  `saint.am.md` each start with `amReviewPending: true`; change it to
  `false` once the parish has read them (see **The About page texts**
  above).
- **Two fasting periods with a single reliable source for their end date**:
  the Fast of the Prophets/Advent (ጾመ ነቢያት, Tsome Nebiyat) and the Fast of
  the Apostles (ጾመ ሐዋርያት, Tsome Hawariat). Both show a "dates pending parish
  confirmation" note on the Calendar page. Details and sources are in
  `docs/research/feasts.md`.
- **Two of the saint's feast days that are not shown on the site at all**,
  because each rests on a single source: Ginbot 12 (translation of his
  relics) and Megabit 24 (his conception). See
  `docs/research/about-claims.md` (rows B7c/B7d) and the "Pending parish
  confirmation" section of `docs/research/feasts.md`.
- **Feasts nobody has researched yet**, listed as candidates in
  `docs/research/feasts.md` under "Candidates for future research": Tsinset
  (Megabit 29), Debre Tabor (Nehase 13), the Feast of Sts Peter and Paul
  (Hamle 5), three more Bahire Hasab observances (Debre Zeit, Rikbe Kahnat,
  Tsome Dihnet), and three minor feasts (Gizret, Qana Ze-Galila, Lidete
  Simeon).

For the full sourcing behind any of this — what was checked, against what,
and how confident it is — see `docs/research/`.

---

## Maintenance

- **The movable-feast table needs extending in 2038.** Fasika (Easter) and
  everything that depends on it (Great Lent, Palm Sunday, Good Friday,
  Ascension, Pentecost and the rest) come from a verified lookup table,
  `FASIKA_TABLE` in `src/lib/feasts/movable.ts`, covering Ethiopian years
  2016–2030 (Gregorian 2024–2038). Past that, the Calendar page still shows
  the fixed feasts (Enkutatash, Meskel, Genna, Timket and so on) and a
  visible "movable feast and fast dates are not yet available for this
  year" note — it never guesses. Before Ethiopian year 2031 (September
  2038), add more rows to `FASIKA_TABLE`, each verified against at least two
  independent Eastern-Orthodox Easter tables, following the pattern
  documented in `docs/research/feasts.md`.
- **The calendar only covers Gregorian 1900–2100.** Both directions of the
  Ethiopian↔Gregorian conversion (`src/lib/ecal/`) reject dates outside
  that window rather than extrapolate silently. This comfortably covers
  the parish's foreseeable use; extending it would mean re-verifying the
  reference table and oracle test in `docs/research/ecal-reference.md`.
- **Updating dependencies.** Run `npm outdated` to see what's behind, then
  `npm update` for routine updates. Always run `npm test`, `npm run check`
  and `npm run build` afterwards. See **Known limitations** below for the
  current `npm audit` findings and why the project stays on Astro 5 for now.

---

## Troubleshooting

- **A gallery or events change I deleted still shows up locally.** Astro
  caches content in `.astro/` and `node_modules/.astro`. Delete both
  folders and rebuild (`npm run build` or `npm run dev` again) — this
  never affects the live site, only a local preview after removing content.
- **`npm run build` stops with an error naming `src/data/site.ts`.** That
  means one of the values you typed doesn't match the expected format; see
  **Where the facts live** above for a worked example of the error message,
  and the field's row in the tables there for the exact format expected.
- **Amharic text looks like empty boxes after regenerating the social-share
  image** (`npm run og:image`). That script needs your computer's
  font system (fontconfig) to find the Ethiopic font bundled with the
  project; on some setups it can only find your system's default fonts.
  Confirm by opening the resulting `public/og-image.png` and checking the
  Amharic parish name is legible, not boxes. If it isn't, the image can
  fall back to the English name and the cross motif only — check with
  whoever last regenerated it before assuming your computer is at fault.
- **A test fails after editing Amharic text.** Two automatic checks exist
  specifically for this:
  - A short list of known misspellings (`AM_KNOWN_MISSPELLINGS` in
    `tests/i18n.test.ts`) — if the failure names one, you've reintroduced a
    spelling that was deliberately corrected; use the suggested spelling.
  - The **parity test**: `en.json` and `am.json` must have exactly the same
    set of keys. If you added or renamed a key in one file, make the same
    change in the other.

---

## Known limitations

- **`npm audit` reports advisories with no fix available in our supported
  versions**, re-checked most recently in Phase 4:
  - **Astro** (and its bundled **esbuild**): several advisories, including
    critical ones, are fixed only in Astro 7. None of them apply to this
    site: they concern server-rendered pages, client-side view-transition
    directives, and remote/AVIF image optimization, and this project uses
    none of those (`output: 'static'`, no adapter, no `client:*`
    directives, no `astro:assets` image processing). Astro 7 also requires
    Node 22.12, while this project supports Node 20. The esbuild advisory
    is specific to its local dev server on Windows, which this project's
    CI never runs.
  - **sharp**: known `libvips`/`libheif` advisories. sharp is never called
    during the website's build — only offline, by hand, by
    `npm run gallery:placeholders` and `npm run og:image`, and only on
    images this project generates itself, never on a visitor's or
    stranger's file.
  - **@vitest/mocker** (a test-only tool): a path-traversal advisory fixed
    only in vitest 5, a major upgrade from this project's vitest 3 that
    risks breaking every test's use of Astro's Container API. It affects
    test runs only, never the deployed site, and every mock in this
    project's tests is first-party code, not visitor input.

  Keep it that way: don't add server rendering, adapters, `client:*`
  directives, or Astro's built-in image processing. Re-run `npm audit` (see
  **Maintenance**) whenever dependencies are updated, and reconsider this
  decision if a non-breaking patch becomes available.
- **Movable feasts are verified only through Ethiopian year 2030
  (Gregorian 2038)**, and the Ethiopian↔Gregorian conversion only covers
  Gregorian 1900–2100. See **Maintenance** above.
- **Two fasting periods and two of the saint's feast days need a second
  source or parish confirmation** before they can be shown with full
  confidence. See **What still needs parish review** above.

---

## Future work

Everything planned for the initial build now exists: all nine pages, the
Ethiopian calendar, Giving, Events & Announcements, the Gallery, and the
accessibility, SEO and documentation pass. Ideas for later, none of them
required:

- Research and add the feasts listed as "candidates for future research" in
  `docs/research/feasts.md` (Tsinset, Debre Tabor, and the others), once a
  second independent source is found for each.
- An option to display Ethiopian dates using Ge'ez numerals (፩, ፪, ፫…)
  instead of Western digits — noted as an open question in
  `ECAL_AM_NEEDS_REVIEW`, not yet decided.
- Replace the six computer-generated placeholder gallery images with real
  parish photos (see **Removing the six placeholder photos** above).
- Extend `FASIKA_TABLE` well past its current 2038 horizon in one pass,
  rather than a few years at a time.
- A livestream embed on the Services page, once the parish settles on a
  streaming platform — today it's a single link slot by design.
- A calendar-file (`.ics`) or RSS feed of upcoming events, generated from
  the same `src/content/events/` files that already drive the events page.
