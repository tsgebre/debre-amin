# Fixed feasts, fasts and commemorations — verification record (P2-02)

RESEARCHER-verified data behind `src/lib/feasts/fixed.ts`. Each shipped
entry has an anchor matching its `sourceRef`, with its Ethiopian date or
rule, its Amharic name and at least two sources. Movable feasts (Fasika and
its dependents) are not covered here; they belong to P2-03.

Gregorian dates in parish-calendar sources (eotc-ma) are glosses and are
often wrong. They are never used as expected values. Only the Ethiopian
dates are taken from those sources.

## Dated observances used as test expectations

Each value below comes from a dated news source or a dated observance, not
from `src/lib/ecal`. `tests/feasts/fixed.test.ts` asserts these Gregorian
dates directly.

| EC year | Enkutatash (Meskerem 1) | Meskel (Meskerem 17) | Genna | Timket (Tir 11) |
|---|---|---|---|---|
| 2016 | **Sep 12, 2023**: WHO AFRO, "New Year tomorrow, 12th September" | **Sep 28, 2023**: ENA Demera dateline "September 27/2023", "Eve of Meskel" | **Jan 7, 2024**, Tahsas 28: ENA "January 7/2024" (ENA's "Tahsas 29" is wrong; see [Genna](#genna)) | **Jan 20, 2024**: Borkena, Jan 20, 2024 |
| 2017 | **Sep 11, 2024**: Tadias 09/11/2024; TV BRICS 13.09.24 | **Sep 27, 2024**: ENA Demera Sep 26, 2024 (search summary only) | **Jan 7, 2025**: ENA Lalibela; Jamaica Gleaner Jan 12, 2025 | **Jan 19, 2025**: ENA Jan 18, 2025 (Ketera on the 18th) |
| 2018 | **Sep 11, 2025**: ENA eng_7316204; Pulse Sep 11, 2025 | **Sep 27, 2025**: Borkena Sep 26, 2025 (Demera) | **Jan 7, 2026**: Fana; BellaNaija Jan 2026 | **Jan 19, 2026**: Borkena Jan 19, 2026; Africanews Jan 20, 2026 |
| 2019 | Sep 11, 2026 (computed) | Sep 27, 2026 (computed) | Jan 7, 2027, Tahsas 29 (computed) | Jan 19, 2027 (computed) |
| 2020 | Sep 12, 2027 (computed) | Sep 28, 2027 (computed) | Jan 7, 2028, Tahsas 28 (computed) | Jan 20, 2028 (computed) |

The "computed" rows were derived by the RESEARCHER from the rule, not from
observed events, because those feasts have not happened yet. Enkutatash 2019
and 2020 are also rows 4 and 5 of `docs/research/ecal-reference.md`.

---

<a id="enkutatash"></a>
### Enkutatash (እንቁጣጣሽ): Meskerem 1

- **Rule:** fixed, Meskerem 1. It is also the feast of St John the Baptist.
  The liturgical name is ርእሰ ዐውደ ዓመት.
- **Sources:**
  - Keraneyo MedhaneAlem parish calendar,
    https://www.eotc-ma.com/beliefs-and-origins-order-of-calend: "Meskerem 1
    (September 11): Ethiopian New Year; Kidus Yohannes".
  - Wikipedia, Public holidays in Ethiopia,
    https://en.wikipedia.org/wiki/Public_holidays_in_Ethiopia: "11 September
    (Leap year: 12 September)".
  - Dated observances: see the table above.
- **Confidence:** high.

<a id="meskel"></a>
### Meskel (መስቀል): Meskerem 17

- **Rule:** fixed, Meskerem 17. It is never Meskerem 16. The Gregorian date
  moves between Sep 27 and Sep 28.
- **Sources:**
  - Wikipedia, Meskel, https://en.wikipedia.org/wiki/Meskel: "27 September,
    Gregorian calendar, or on 28 September in leap years".
  - Keraneyo MedhaneAlem parish calendar: "Meskerem 17 (September 27): Meskel
    – Finding of the True Cross".
  - St Mary Vancouver EOTC, http://www.saintmaryvancouver.org/eotc_tradition.htm:
    "Meskerem 17, (September 27)".
- **Conflict:** Wikipedia's "leap years" is misleading. Meskel fell on
  Sep 28 in 2023, which is not a Gregorian leap year. It was the year after
  an *Ethiopian* leap year. ENA's Sep 27, 2023 Demera ("Eve of Meskel")
  dateline confirms this.
- **Not shipped:** Demera (ደመራ), the eve on Meskerem 16, is well sourced
  but awaits the Architect's approval.
- **Confidence:** high.

<a id="tsome-nebiyat"></a>
### Fast of the Prophets / Advent (ጾመ ነቢያት): Hidar 15 to the eve of Genna

- **Rule (computed):** starts Hidar 15. Ends on the eve of Genna: Tahsas 28,
  or **Tahsas 27 in ዘመነ ዮሐንስ** (EC year % 4 === 0). The fast is 44 days,
  or 43 in ዘመነ ዮሐንስ. Also written ጾመ ነብያት; popularly called የገና ጾም.
- **Sources:**
  - Mahibere Kidusan (Amharic, Nov 24, 2016),
    https://eotcmk.org/a/ጾመ-ነቢያት-የገና-ጾም/: "ከኅዳር ፲፭ ቀን ጀምሮ እስከ በዓለ ልደት
    ዋዜማ ድረስ".
  - Mahibere Kidusan (Amharic, Hidar 14, 2014 EC), https://eotcmk.org/a/ጾመ-ነቢያት-5/:
    "ከኅዳር ፲፭ ጀምሮ … እስከ … የልደት በዓል ድረስ".
  - Astemhro (2019), https://astemhro.com/2019/11/23/fasting-of-prophets/:
    "ከኅዳር 15 ጀምሮ እስከ ታኅሳስ 28 ቀን (በዘመነ ዮሐንስ እስከ ታኅሳስ 27 ቀን) ድረስ ለ44
    ቀናት (በዘመነ ዮሐንስ ለ 43 ቀናት) ይጾማል".
  - Wikipedia, Fasting and abstinence in the EOTC,
    https://en.wikipedia.org/wiki/Fasting_and_abstinence_in_the_Ethiopian_Orthodox_Tewahedo_Church:
    "begins … on 15th Hedar and ends on Christmas Eve".
- **Conflicts:**
  - Melkamu Beyene's blog (Nov 23, 2016) gives a minority model with a moving
    start and a fixed 43 days: Hidar 16 to Tahsas 29, or Hidar 15 to
    Tahsas 28 in ዘመነ ዮሐንስ. The Mahibere Kidusan sources outweigh it.
  - Stated lengths vary: 40, 43, 44 and "approximately 45" days. **The site
    must not display a day count.**
- **Confidence:** **medium.** The start and the "eve of Genna" end are well
  supported. The ዘመነ ዮሐንስ end rests on Astemhro plus arithmetic. A printed
  EOTC ባሕረ ሐሳብ, or the parish, would raise it to high.

<a id="teklehaymanot-birth"></a>
### Birth of Abune Teklehaymanot (የአቡነ ተክለ ሃይማኖት በዓለ ልደት): Tahsas 24

- **Rule:** fixed, Tahsas 24.
- **Sources:**
  - Mahibere Kidusan (Amharic),
    https://eotcmk.org/a/የአቡነ-ተክለ-ሃይማኖት-በዓለ-ዕረፍት-2/: "ታኅሣሥ ፳፬ ቀን …".
  - Keraneyo MedhaneAlem parish calendar: "Tahisas 24 … Abuna Takla
    Haymanot's birth date".
  - `docs/research/about-claims.md`, row B7a (the Mahibere Kidusan English
    pages).
- **Confidence:** high.

<a id="genna"></a>
### Genna (ገና / በዓለ ልደት): Tahsas 29, or Tahsas 28 in ዘመነ ዮሐንስ

- **Rule (computed):**
  ```
  gennaDay(ecYear) = (ecYear % 4 === 0) ? 28 : 29   // month = Tahsas
  ```
  `ecYear % 4 === 0` means ዘመነ ዮሐንስ: the preceding Pagume had 6 days.
  Genna is always **Julian Dec 25**. In Gregorian terms:
  - EC 1892 (Tahsas 28) is **Jan 6, 1900**.
  - EC 1893–2092 fall on **Jan 7**.
  - From EC 2093 onwards they fall on **Jan 8** (Jan 8, 2101 is outside the
    supported range).
  - "Always Gregorian Jan 7" is therefore wrong. The code implements the
    Tahsas rule, not a Gregorian constant.
- **Sources:**
  - Prof. Getachew Haile, "የገና በዓል በዘመነ ዮሐንስ",
    https://ethiopiazare.com/amharic/history/history/2039-pro-getachew-haile482:
    - "ልደት የሚውልበት ታኅሣሥ 29 ቀደም ብሎ በታኅሣሥ 28 ቀን ይውላል"
    - "ጳጒሜ 6 ቀናት የምትሆነው በዘመነ ሉቃስ ነው"
    - "የሠግር 28 ቀንና የአዘቦቱ 29 ቀን ሁለቱም እኩል ዮናርዮስ 7 ናቸው"
  - CopticChurch.net, https://www.copticchurch.net/calendar/article/nativitydate.html:
    the Jan 7 date "will become 8 January after the year 2100 A.D."
  - Astemhro (above): the eve falls on Tahsas 27 in ዘመነ ዮሐንስ, so Genna
    falls on Tahsas 28.
  - Keraneyo MedhaneAlem parish calendar: "Christmas observance shifts to
    Tahsas 28 … during leap years". Its "(January 6)" gloss is wrong.
- **Conflicts, quoted verbatim:**
  - ENA, dateline "Addis Ababa January 7/2024": "celebrated on 7 January
    (Tahsas 29 in the Ethiopian calendar)". This is boilerplate: Jan 7, 2024
    was Tahsas 28.
  - Wikipedia, Ethiopian Christmas: "7 January (Tahsas 29 …)", with no
    exception for ዘመነ ዮሐንስ.
  - Mahibere Kidusan English (Nov 24, 2015) confuses the eve with the feast,
    and its Gregorian dates are wrong. Not cited.
- **Confidence:** high.

<a id="ketera"></a>
### Ketera (ከተራ): Tir 10

- **Rule:** fixed, Tir 10, the eve of Timket.
- **Sources:**
  - Keraneyo MedhaneAlem parish calendar: "Tire 10 (January 18): Ketera".
  - ENA, dateline "Addis Ababa, January 18, 2025",
    https://www.ena.et/web/eng/w/eng_5811544: "Every year on the eve of Timkat
    18 January, commonly known as Kettera".
- **Confidence:** high.

<a id="timket"></a>
### Timket (ጥምቀት): Tir 11

- **Rule:** fixed, Tir 11. Unlike Genna there is no adjustment, so Timket
  falls on Jan 20 in ዘመነ ዮሐንስ, and Genna and Timket are then 13 days apart
  instead of 12.
- **Sources:**
  - Wikipedia, Timkat, https://en.wikipedia.org/wiki/Timkat: "corresponding to
    the 11th day of Terr"; "19 January (or 20 in a leap year)".
  - Keraneyo MedhaneAlem parish calendar: "Tire 11 (January 19): Epiphany
    -Timket".
  - Borkena, Jan 20, 2024,
    https://borkena.com/2024/01/20/ethiopia-celebrates-epiphany-nationwide/.
- **Confidence:** high.

<a id="tsome-filseta"></a>
### Fast of the Assumption (ጾመ ፍልሰታ): Nehase 1–15

- **Rule:** fixed range, Nehase 1 to Nehase 15 inclusive (15 days).
- **Sources:**
  - Mahibere Kidusan (Aug 22, 2016),
    https://eotcmk.org/e/filseta-the-fast-of-the-assumption-of-st-mary-2/:
    "covers the period from the 1st to the 15th of Nehasie".
  - Wikipedia, Fasting and abstinence in the EOTC: "15 days".
  - Keraneyo MedhaneAlem, https://www.eotc-ma.com/the-order-of-fasts:
    "ጾመ ፍልሰታ (Tsome Filiseta)".
- **Conflict:** eotc-ma also gives "Nehassie 1st … to Nehase 16th" alongside
  "15 days", which contradicts itself. The majority reading, Nehase 1–15, is
  shipped.
- **Confidence:** high.

<a id="filseta"></a>
### Filseta, the Assumption of St. Mary (ፍልሰታ ለማርያም): Nehase 16

- **Rule:** fixed, Nehase 16.
- **Sources:**
  - Mahibere Kidusan (above): feast on Nehasie 16.
  - St Mary Vancouver EOTC: "Nehassie 16, August 22".
- **Confidence:** high.

<a id="teklehaymanot-repose"></a>
### Repose of Abune Teklehaymanot (የአቡነ ተክለ ሃይማኖት በዓለ ዕረፍት): Nehase 24

- **Rule:** fixed, Nehase 24.
- **Sources:**
  - Mahibere Kidusan (Amharic), page titled "የአቡነ ተክለ ሃይማኖት በዓለ ዕረፍት",
    https://eotcmk.org/a/የአቡነ-ተክለ-ሃይማኖት-በዓለ-ዕረፍት-2/: "ነሐሴ ፳፬ …".
  - DACB (Taddesse Tamrat): "Synaxarium, 24 Nähasé".
  - Keraneyo MedhaneAlem parish calendar.
- **Confidence:** high.

<a id="teklehaymanot-monthly"></a>
### Monthly commemoration of Abune Teklehaymanot (የአቡነ ተክለ ሃይማኖት ወርሃዊ በዓል): the 24th of months 1–12

- **Rule:** the 24th of Meskerem through Nehase, 12 per year. Pagume never
  has a 24th. The Tahsas 24 and Nehase 24 entries are marked `annual: true`
  rather than listed twice.
- **Sources:**
  - EOTC official list of monthly feasts (ወርሃዊ በዓላት),
    https://www.ethiopianorthodox.org/amharic/abeyetbealat/werawi%20bealat.pdf:
    "፳፬/24= አቡነ ተክለ ሃይማኖት". The spelling ወርሃዊ follows this document.
  - Mahibere Kidusan English: "monthly feast on the 24th day of every month".
- **Confidence:** high.

---

## Pending parish confirmation (NOT shipped)

<!--
  These annual dates for the saint are NOT in src/lib/feasts. Each rests on a
  single publisher (see docs/research/about-claims.md rows B7c and B7d). Ship
  them only after the parish confirms them.

  - Ginbot 12: translation of his relics to Debre Libanos.
    Mahibere Kidusan, two pages from the same publisher.
  - Megabit 24: his conception (ጽንሰት). Mahibere Kidusan only.
-->

- **Ginbot 12:** translation of the saint's relics. Pending parish confirmation.
- **Megabit 24:** the saint's conception (ጽንሰት). Pending parish confirmation.

## Reported but not shipped (would need Architect approval)

- **Demera (ደመራ):** Meskerem 16, the eve of Meskel. Well sourced (Wikipedia
  Meskel; ENA Sep 27, 2023).
- **Tsinset / Annunciation (ጽንሰት / በዓለ ወልድ):** Megabit 29. Medium
  confidence: one parish calendar plus a secondary list.
- **Debre Tabor (ደብረ ታቦር / ቡሄ):** Nehase 13. Medium confidence: the parish
  calendar only, with the Mahibere Kidusan page not confirmed.
- **Gizret (Tir 6), Qana Ze-Galila (Tir 12), Lidete Simeon (Yekatit 8):**
  low to medium confidence. Not recommended without a second source.
