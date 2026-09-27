# Ethiopian↔Gregorian reference dates — verification record (P2-01)

RESEARCHER-verified reference table backing `tests/ecal/reference.test.ts`
and `tests/ecal/today.test.ts`. Every row was checked against two
independent source classes; no genuine source disputes any row.

**Verification method.** Each row was verified by:

- **Class A — published tables/events:** webcal.guru's Ethiopian date list,
  truecalendar.com's EC-2016 year table, date-bearing news of record
  (WHO AFRO, ABC News, VOA, Anadolu Agency, ENA), and the published
  alignment rule (Wikipedia "Ethiopian calendar": Meskerem 1 "for years
  between 1900 and 2099 (inclusive), is usually 11 September… It falls on
  12 September in years before the Gregorian leap year").
- **Class B — published algorithm:** the Beyene–Kudlek conversion
  (geez.org; constants and formulas verbatim from
  `utopiaio/Ethiopic-Calendar` `index.js`:
  `JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856`,
  `jdn = (era + 365) + 365*(y−1) + floor(y/4) + 30*m + d − 31`),
  evaluated by hand for every row against the standard JDN anchors, plus an
  independent 1461-day-cycle re-derivation. All agree on every row.

Rows without a row-specific table/event source (13, 14, 16, 17) are labelled
**algorithm-verified**: they rest on the published rule plus the published
algorithm rather than an archival almanac page.

**Genna warning.** No row uses "Ethiopian Christmas" as a reference —
Genna's observed date follows a liturgical rule and is sometimes Tahsas 28,
so it is useless as a conversion anchor.

## Reference rows

| # | Gregorian | Ethiopian | Class | Sources |
|---|---|---|---|---|
| 1 | 2023-09-12 | Meskerem 1, 2016 | A+B | WHO AFRO ("Ethiopia to celebrate its New Year tomorrow, 12th September", EC 2016); truecalendar EC-2016 ("Tue, 12 Sep 2023") |
| 2 | 2024-09-11 | Meskerem 1, 2017 | A+B | truecalendar EC-2016 (year ends "Tue, 10 Sep 2024"); EBSCO/Wikipedia Sep-11 rule |
| 3 | 2025-09-11 | Meskerem 1, 2018 | rule+B | Wikipedia/EBSCO Sep-11 rule (2026 not a Gregorian leap year); Beyene–Kudlek |
| 4 | 2026-09-11 | Meskerem 1, 2019 | A+B | webcal.guru ("September 11, 2026 = 1 Mäskäräm, 2019"); Beyene–Kudlek |
| 5 | 2027-09-12 | Meskerem 1, 2020 | rule+B | Wikipedia rule (Sep 12 before Gregorian leap year 2028); Beyene–Kudlek. See caveat (a) |
| 6 | 2007-09-12 | Meskerem 1, 2000 | A+B | ABC News dateline Wed 12 Sep 2007 (Millennium); VOA millennium coverage. See caveat (b) |
| 7 | 2023-09-06 | Pagume 1, 2015 | rule+B | Six days before the WHO-documented Sep-12-2023 New Year; Beyene–Kudlek |
| 8 | 2023-09-11 | Pagume 6, 2015 | rule+B | Pagume-6-on-Sep-11-before-Gregorian-leap-year rule; day before WHO-documented New Year. See caveat (c) |
| 9 | 2026-09-10 | Pagume 5, 2018 | A+B | webcal.guru ("September 10, 2026 = 5 Ṗagʷəmen, 2018"); Beyene–Kudlek |
| 10 | 2000-01-01 | Tahsas 22, 1992 | A+B ×3 | Oracle anchor, three routes: B-K formula = 2451545 = J2000 JDN (Wikipedia "Julian day"); rule-anchored count (Meskerem 1, 1992 = Sep 12, 1999 + 111 days); 1461-day-cycle arithmetic |
| 11 | 2024-02-29 | Yekatit 21, 2016 | A+B | truecalendar EC-2016 (Yekatit = "Fri, 9 Feb 2024 – Sat, 9 Mar 2024" ⇒ Yekatit 21 = Feb 29); Adwa Victory Day (Yekatit 23) on March 2, 2024 (Anadolu/ENA). See caveat (d) |
| 12 | 2024-03-01 | Yekatit 22, 2016 | A+B | Same two sources as row 11 |
| 13 | 2028-02-29 | Yekatit 21, 2020 | algorithm-verified | Beyene–Kudlek; count from row 5 (Sep 12, 2027 + 170 days) |
| 14 | 1900-01-01 | Tahsas 23, 1892 | algorithm-verified | B-K formula = 2415021 = standard JDN of 1900-01-01 (Wikipedia "Julian day", Dublin JD epoch). Implies Meskerem 1, 1892 = Sep 11, 1899 — one day off the 1900–2099 pattern, exactly the century-boundary effect Wikipedia scopes its rule around. **A naive converter yields Tahsas 22 here — wrong.** |
| 15 | 1941-05-05 | Miyazia 27, 1933 | A+B | Wikipedia "Ethiopian Patriots' Victory Day" ("also called Meyazia 27", Haile Selassie entered Addis Ababa 5 May 1941); lughayangu "Today in African History" ("May 5th (Miaza 27…) 1941"); EC year 1933 from Beyene–Kudlek |
| 16 | 2095-01-01 | Tahsas 23, 2087 | algorithm-verified | B-K (JDN = 2451545 + 95×365 + 24 = 2486244); rule-anchored count (Meskerem 1, 2087 = Sep 11, 2094 + 112 days) |
| 17 | 2100-09-12 | Meskerem 1, 2093 | algorithm-verified | B-K (JDN 2488324); Wikipedia century-boundary statement (Sep-11 correspondence holds only 1900–2099; "1900 and 2100 are not Gregorian leap years but are Ethiopian leap years", so the alignment shifts +1 day after Feb 2100) |
| 18 | 2026-09-27 | Meskerem 17, 2019 | A+B | webcal.guru ("September 27, 2026 = 17 Mäskäräm, 2019"); Beyene–Kudlek. Today-sanity row |

## Time-zone facts (tests/ecal/today.test.ts)

CONFIRMED. Wikipedia "Eastern Time Zone": "Eastern Daylight Time (EDT),
which is four hours behind Coordinated Universal Time (UTC−04:00)"; DST
runs from the second Sunday in March to the first Sunday in November
(Nov 1 in 2026). So at 2026-09-11 03:30 UTC, New York is on EDT and the
civil date there is still Sep 10, 2026 = Pagume 5, 2018 EC (row 9), while
the same instant in UTC is Sep 11, 2026 = Meskerem 1, 2019 EC (row 4).

## JDN anchors

- **Meskerem 1, 1 EC = JDN 1724221.** From the published Beyene–Kudlek
  constants: `(1723856 + 365) + 0 + floor(1/4) + 30×1 + 1 − 31 = 1724221`.
  Cross-checked end-to-end: the same epoch reproduces the news-documented
  Millennium (EC 2000-01-01 → JDN 2454356 = 2007-09-12).
  **Trap:** 1723856 is B-K's *era offset* for Amete Mihret, not the JDN of
  Meskerem 1, year 1 — their formula adds 365; conflating the two is a
  known one-year-off error.
- **Gregorian 2000-01-01 = JDN 2451545.** Wikipedia "Julian day", verbatim:
  "the Julian day number for the day starting at 12:00 UT (noon) on
  January 1, 2000, was 2451545."

## CLDR Amharic Gregorian month names (src/lib/ecal/format.ts)

CONFIRMED. Verbatim from `unicode-org/cldr-json` `am/ca-gregorian.json`
(months, wide): ጃንዋሪ, ፌብሩዋሪ, ማርች, ኤፕሪል, ሜይ, ጁን, ጁላይ, ኦገስት, ሴፕቴምበር,
ኦክቶበር, ኖቬምበር, ዲሴምበር — exactly what Node emits. Standard modern
written-Amharic transcriptions (CLDR-vetted, consumed by ICU/Node/Android).
Minor caveat: loanword spelling varies slightly across Ethiopian
publications (e.g., ፌብሩዋሪ vs ፌብርዋሪ); CLDR's forms are a safe default and
are flagged in `ECAL_AM_NEEDS_REVIEW` for parish preference.

## Source-error caveats found during verification

- **(a) Row 5:** a first fetch of webcal.guru appeared to say
  "September 11, 2027 = 1 Mäskäräm 2020"; a targeted re-fetch showed the
  page contains no September 2027 dates at all (it ends March 2027) — a
  summarization artifact, not page content. No real conflict.
- **(b) Row 6:** Wikipedia "Ethiopian third millennium" says "celebrated on
  Wednesday, 11 September 2007" — internally inconsistent (Sep 11, 2007 was
  a Tuesday; the Wednesday was Sep 12) and contradicted by ABC's Sep-12
  dateline. Likely conflates New Year's Eve with Meskerem 1. Do not cite
  that article for the date.
- **(c) Row 8:** one search-result summary asserted "Pagume 6, 2015 =
  September 10, 2023" while quoting the very rule that puts Pagume 6 on
  September 11. Contradicted by the Sep-12-2023 New Year anchor; ignored.
- **(d) Rows 11–12:** a fetch summary placed Yekatit 21 on "1 Mar" while
  quoting the page's own month range "Fri, 9 Feb 2024 – Sat, 9 Mar 2024"
  (which forces Yekatit 21 = Feb 29). The verbatim range and the
  independent Adwa cross-check agree; the range is cited, not the aside.

## Sources

- webcal.guru — Dates according to the Ethiopian calendar 2026–2027:
  https://www.webcal.guru/en/event_list/system_ethiopian
- truecalendar.com — Ethiopic Calendar 2016 (2023–2024 AD):
  https://truecalendar.com/ethiopic/2016
- utopiaio/Ethiopic-Calendar `index.js` (Beyene–Kudlek implementation):
  https://raw.githubusercontent.com/utopiaio/Ethiopic-Calendar/master/index.js
- The Ethiopic Calendar — geez.org (Beyene–Kudlek provenance):
  https://www.geez.org/Calendars/
- Wikipedia — Ethiopian calendar:
  https://en.wikipedia.org/wiki/Ethiopian_calendar
- Wikipedia — Julian day: https://en.wikipedia.org/wiki/Julian_day
- WHO AFRO — Ethiopia to celebrate its New Year tomorrow, 12th September:
  https://www.afro.who.int/news/ethiopia-celebrate-its-new-year-tomorrow-12th-september
- ABC News — Ethiopia ushers in year 2000 (12 Sep 2007):
  https://www.abc.net.au/news/2007-09-12/ethiopia-ushers-in-year-2000/667556
- VOA — Ethiopia Celebrates New Millennium:
  https://www.voanews.com/a/a-13-2007-10-25-voa31/402297.html
- Wikipedia — Ethiopian third millennium (caveat (b) only; do not cite for
  the date): https://en.wikipedia.org/wiki/Ethiopian_third_millennium
- Anadolu Agency — Ethiopia commemorates 128th anniversary of Adwa victory:
  https://www.aa.com.tr/en/africa/ethiopia-commemorates-128th-anniversary-of-adwa-victory-with-pan-african-flair/3153375
- ENA — Ethiopians Marking 128th Anniversary:
  https://www.ena.et/web/eng/w/eng_4104431
- Wikipedia — Ethiopian Patriots' Victory Day:
  https://en.wikipedia.org/wiki/Ethiopian_Patriots%27_Victory_Day
- lughayangu — Today in African History: May 5:
  https://lughayangu.com/today-in-history/day/may-05
- Wikipedia — Eastern Time Zone:
  https://en.wikipedia.org/wiki/Eastern_Time_Zone
- unicode-org/cldr-json — am/ca-gregorian.json:
  https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-dates-full/main/am/ca-gregorian.json
- EBSCO Research Starters — Ethiopian New Year:
  https://www.ebsco.com/research-starters/history/ethiopian-new-year

**Confidence:** HIGH for rows with event/table coverage (1, 2, 4, 6, 9, 10,
11, 12, 15, 18), the JDN anchors, the time-zone facts and the CLDR names.
Rows 3, 5, 7, 8, 13, 14, 16, 17 rest on the published rule plus the
published algorithm; the algebra leaves no room for a different answer, but
they are labelled algorithm-verified above for honesty.
