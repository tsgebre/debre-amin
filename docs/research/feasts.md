# Fixed feasts, fasts and commemorations — verification record (P2-02)

RESEARCHER-verified data behind `src/lib/feasts/fixed.ts`. Each shipped
entry has an anchor matching its `sourceRef`, with its Ethiopian date or
rule, its Amharic name and at least two sources. Movable feasts (Fasika and
its dependents, P2-03) are covered in the second half of this document.

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
- **Eve:** Demera is shipped as its own entry. See [Demera](#demera).
- **Confidence:** high.

<a id="demera"></a>
### Demera, the eve of Meskel (ደመራ): Meskerem 16

- **Rule:** fixed, Meskerem 16. The Architect approved it in P2-03.
- **Sources:**
  - Wikipedia, Meskel, https://en.wikipedia.org/wiki/Meskel: Demera "takes
    place in the early evening the day before Meskel or on the day itself".
  - ENA, Sep 27, 2023, https://www.ena.et/web/eng/w/eng_3386146: Demera "is
    conducted on the Eve of Meskel commemoration".
- **Dated observances:** Sep 27, 2023 (ENA); Sep 26, 2024 (ENA, search
  summary only); Sep 26, 2025 (Borkena,
  https://borkena.com/2025/09/26/meskel-demera-celebrated-across-ethiopia/).
- **Note:** the RESEARCHER found no third source, such as an EOTC or
  Mahibere Kidusan page, naming ደመራ on Meskerem 16. Neither Debreselam
  calendar lists it.
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

---

# Movable feasts and fasts (P2-03), `src/lib/feasts/movable.ts`

Every movable observance is a day offset from that Ethiopian year's Fasika.
Fasika comes from a lookup table, not a computus. `tests/feasts/movable.test.ts`
cross-checks every row against an independent Julian computus (Meeus),
confirms each date is a Sunday, and checks the offsets by counting days.
For years outside the table, the module returns no movable occurrences and
`feastsForYear` reports `movableAvailable: false`. It never guesses.

**Common offset sources** (called (a) to (d) below):

- **(a)** Debreselam Medhanealem EOTC (Minnesota), EC 2016 calendar,
  https://www.debreselam.net/?p=15549. It prints Ethiopic and Gregorian
  dates.
- **(b)** Debreselam EC 2017 calendar, https://www.debreselam.net/?p=16337.
  Its Gregorian dates for ጰራቅሊጦስ ("June 11, 2025"; correctly June 8) and
  ጾመ ድኅነት are typos. It is not cited for those.
- **(c)** Mahibere Kidusan, "የ፳፻፲፩ ዓ.ም የአጽዋማት ባሕረ ሐሳባዊ ቀመር",
  https://eotcmk.org/a/የ፳፻፲፩-ዓ-ም-የአጽዋማት-ባሕረ-ሐሳባዊ/. It works through
  EC 2011: Nenewe Yekatit 11, Fasika Miyazia 20, Erget Ginbot 29,
  Peraklitos Sene 9, Tsome Hawariat Sene 10.
- **(d)** Wikipedia, Bahre Hasab, https://en.wikipedia.org/wiki/Bahre_Hasab.
  It counts days after Nenewe: "Abiy Tsom +14, Debre Zeit +41, Hosanna +62,
  Siklet +67, Fasika +69", and states "The fast of Nenewe (Nineveh) begins
  on a Monday."

**ተውሳክ trap:** the ተውሳክ values given by eotc-ma and (c) (Abiy Tsom 14,
Hosanna 2, Siklet 7, Erget 18, Peraklitos 28, Tsome Hawariat 29, …) are day
counts mod 30 with month rollover. **They are not day offsets.** The code
does not use them.

<a id="fasika"></a>
### Fasika (ፋሲካ / ትንሣኤ): lookup table, EC 2016–2030

- **S1:** Wikipedia, List of dates for Easter,
  https://en.wikipedia.org/wiki/List_of_dates_for_Easter. The "Julian
  Easter" column gives Gregorian dates.
- **S2:** Serbian Orthodox Diocese of Western America paschalion,
  https://www.soc-wus.org/ourchurch/calendar.html. Its values are Gregorian
  despite the "Julian Calendar" label.
- **S3:** Bucknell University, Russian Dept., "The Dates of Orthodox Easter",
  https://www.departments.bucknell.edu/russian/Site-prior-to-Easyweb-migration/easter.html.
  This table gives **Julian (old-style)** dates; add 13 days. **Never read
  S3's values as Gregorian**: doing so would shift every row by 13 days.

| EC | Fasika (Gregorian) | S1 | S2 | S3 (Julian → +13) | Dated or EOTC confirmation |
|---|---|---|---|---|---|
| 2016 | 2024-05-05 | May 5 | 05 May | Apr 22 | ENA "Addis Ababa May 5/2024": Fasika "observed … today"; Debreselam (a) "ሚያዝያ 27, 2016 (Sunday May 5, 2024)" |
| 2017 | 2025-04-20 | April 20 | 20 Apr | Apr 7 | Washington Times Apr 20, 2025, "Ethiopians marked Easter festivities on April 20" (search summary); Debreselam (b) "ሚያዝያ 12, 2017 (April 20, 2025)" |
| 2018 | 2026-04-12 | April 12 | 12 Apr | Mar 30 | ENA "Addis Ababa, April 12, 2026": Fasika marked nationwide, "follows a 55-day period of fasting" |
| 2019 | 2027-05-02 | May 2 | 02 May | Apr 19 | |
| 2020 | 2028-04-16 | April 16 | 16 Apr | Apr 3 | |
| 2021 | 2029-04-08 | April 8 | 08 Apr | Mar 26 | |
| 2022 | 2030-04-28 | April 28 | 28 Apr | Apr 15 | |
| 2023 | 2031-04-13 | April 13 | 13 Apr | Mar 31 | |
| 2024 | 2032-05-02 | May 2 | 02 May | Apr 19 | |
| 2025 | 2033-04-24 | April 24 | 24 Apr | Apr 11 | |
| 2026 | 2034-04-09 | April 9 | 09 Apr | Mar 27 | |
| 2027 | 2035-04-29 | April 29 | 29 Apr | Apr 16 | |
| 2028 | 2036-04-20 | April 20 | 20 Apr | Apr 7 | |
| 2029 | 2037-04-05 | April 5 | 05 Apr | Mar 23 | |
| 2030 | 2038-04-25 | April 25 | 25 Apr | Apr 12 | |

Dated sources: ENA 2024, https://www.ena.et/web/eng/w/eng_4394571;
Washington Times 2025,
https://www.washingtontimes.com/news/2025/apr/20/easter-ethiopia-celebrated-calls-charity-peace/;
ENA 2026, https://www.ena.et/web/eng/w/eng_8641709.

EOTC Bahire Hasab uses the same Alexandrian/Julian computus. In every year
checked, the EOTC-computed date matched the Eastern tables: 2011 EC
(Mahibere Kidusan (c): Miyazia 20 = Apr 28, 2019), 2016 and 2017. No year
was found where they differ. **Confidence:** high.

<a id="tsome-nenewe"></a>
### Fast of Nineveh (ጾመ ነነዌ): Fasika −69 to −67

- Monday to Wednesday, 3 days, starting two weeks before Abiy Tsom.
- **Sources:**
  - (a) "የካቲት 18, 2016 (Monday Feb 26, 2024)", which is 69 days before
    May 5, 2024.
  - (d) Fasika is +69 from Nenewe, and "begins on a Monday".
  - (c) Yekatit 11 → Miyazia 20, 2011, is 69 days.
  - eotc-ma, "Order of Fasts", https://www.eotc-ma.com/the-order-of-fasts:
    "three days fast, Monday, Tuesday and Wednesday".
- **Confidence:** high.

<a id="abiy-tsom"></a>
### Great Lent (ዐቢይ ጾም / ሁዳዴ): Fasika −55 to −1

- 55 days, from a Monday through Holy Saturday.
- **Sources:**
  - (a) starts "Monday March 11, 2024", i.e. −55.
  - (b) starts "Feb 24, 2025", i.e. −55.
  - (d) starts 14 days after Nenewe.
  - Wikipedia, Fasting and abstinence in the EOTC: "55 continuous days
    before Easter".
  - ENA 2026: "55-day period of fasting".
- **Conflict:** (a) prints the range as "… – Sunday May 5, 2024", ending on
  Fasika itself; (b) prints the same. A 55-day count from the Monday works
  only if Holy Saturday is the last day: the fast is broken at the Easter
  vigil, and the parish is naming the feast that ends it. The code uses
  −55..−1. **The UI should label the range "until Fasika".**
- **Confidence:** high.

<a id="hosanna"></a>
### Hosanna (ሆሣዕና): Fasika −7

- **Sources:**
  - (a) "ሚያዝያ 20, 2016 (Sunday April 28, 2024)".
  - (b) "ሚያዝያ 5, 2017 (April 13, 2025)".
  - (d) +62 from Nenewe, i.e. −7.
- **Confidence:** high.

<a id="siklet"></a>
### Siklet, Good Friday (ስቅለት): Fasika −2

- **Sources:**
  - (a) "Friday May 3, 2024".
  - (b) "April 18, 2025".
  - (c) Miyazia 18 against Fasika Miyazia 20.
  - (d) +67 from Nenewe, i.e. −2.
- **Confidence:** high.

<a id="erget"></a>
### Erget, Ascension (ዕርገት): Fasika +39, a Thursday

- **Sources:**
  - (a) "ሰኔ 6, 2016 (Thursday June 13, 2024)".
  - (b) "ግንቦት 21, 2017 (May 29, 2025)".
  - (c) ግንቦት 29, 2011, which is 39 days after ሚያዝያ 20.
- **Confidence:** high.

<a id="peraklitos"></a>
### Peraklitos, Pentecost (ጰራቅሊጦስ): Fasika +49

- **Sources:**
  - (a) "ሰኔ 16, 2016 (Sunday June 23, 2024)".
  - (c) ሰኔ 9, 2011.
  - Source (b) is not cited: its Gregorian date is a typo.
- **Confidence:** high.

<a id="tsome-hawariat"></a>
### Fast of the Apostles (ጾመ ሐዋርያት): Fasika +50 to Hamle 4

- **Rule:** starts at Fasika +50, the Monday after Peraklitos. Ends on
  **Hamle 4** of the same EC year, inclusive, which is always July 11 in
  this range. Hamle 5, the feast of Sts Peter and Paul, is the day the fast
  is broken (its ፋሲካ).
- **Start sources:**
  - (a) "ከሰኔ 17, 2016 … (Monday June 24, 2024 …)".
  - (b) "ከሰኔ 2, 2017 … (June 9, 2025 …)".
  - (c) ሰኔ 10, 2011.
  - Mahibere Kidusan English, https://eotcmk.org/e/the-fast-of-the-apostles-3/:
    "begins on the Segno, after Pentecost".
  - No +57 variant appears in any source.
- **End sources:**
  - Mahibere Kidusan (Amharic), https://eotcmk.org/a/ጾመ-ሐዋርያት-እና-ጾመ-ድኅነት-3/:
    "ፋሲካው የቅዱስ ጴጥሮስና ቅዱስ ጳውሎስ በዓለ ዕረፍት ሐምሌ ፭ ቀን".
  - Mahibere Kidusan English: "ends on 5 Hamle …, the Feast of Saints Peter
    and Paul".
  - Wikipedia, Fasting and abstinence in the EOTC: "ends on the 4th of
    Hamle". Its "Gregorian 26 June" gloss is wrong; ignore it.
- **Conflict:** Debreselam (a) lists the fast "ከሰኔ 17, 2016 እሰከ ሀምሌ 5, 2016
  (… – Friday July 12, 2024)", i.e. through the feast day itself.
- **No collision:** the start can never pass Hamle 4. The latest Fasika in
  EC 2016–2030 (May 5) gives a start of June 24, an 18-day fast. The
  latest possible Julian Pascha in 1900–2099 (May 8) still gives 15 days;
  the earliest gives 49. No skip rule is needed, and none was found in the
  sources.
- **Do not display a length.** Sources say "10 to 40 days" and "sometimes
  … beyond forty"; the arithmetic range is 15–49.
- **Confidence:** **medium**, because of the Hamle 4 vs Hamle 5 end. A printed
  EOTC ባሕረ ሐሳብ, or a parish priest confirming whether Hamle 5 itself is
  fasted, would raise it.

---

## Candidates for future research (not in the MVP)

- **Tsinset / Annunciation (ጽንሰት / በዓለ ወልድ):** Megabit 29. Medium
  confidence: one parish calendar plus a secondary list.
- **Debre Tabor (ደብረ ታቦር / ቡሄ):** Nehase 13. Medium confidence: the parish
  calendar only, with the Mahibere Kidusan page not confirmed.
- **Feast of Sts Peter and Paul:** Hamle 5, the day that breaks Tsome
  Hawariat. The Mahibere Kidusan sources above give it; not yet verified as
  a standalone entry.
- **Bahire Hasab observances (not verified):**
  - Debre Zeit (ደብረ ዘይት): Fasika −28.
  - Rikbe Kahnat (ርክበ ካህናት): Fasika +24.
  - Tsome Dihnet (ጾመ ድኅነት): the Wednesday/Friday fasts, resuming at
    Fasika +52. They are suspended for the 50 days after Fasika.
- **Gizret (Tir 6), Qana Ze-Galila (Tir 12), Lidete Simeon (Yekatit 8):**
  low to medium confidence. Not recommended without a second source.

Phase 4 will add this list to the README's pending-review section.
