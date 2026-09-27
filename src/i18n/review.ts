// Amharic keys whose wording must be confirmed by the parish before launch.
export const AM_NEEDS_REVIEW: readonly string[] = [
  'site.name',
  'site.tagline',
  'nav.giving',
  'nav.gallery',
  'nav.clergy',
  'a11y.skipToContent',
  'a11y.mainNav',
  'placeholder.notice',
  'placeholder.tba',
  'services.intro',
  'services.table.scrollLabel',
  'services.liturgy.body',
  'services.sundaySchool.body',
  'services.prayerTeaching.heading',
  'services.prayerTeaching.body',
  'services.livestream.label',
  'contact.intro',
  'contact.map.linkText',
  'clergy.intro',
  'clergy.photoPending',
  'clergy.empty',
  'about.parish.heading',
  'about.amReviewNote',
  'calendar.intro',
  'calendar.months.caption',
  'calendar.months.month',
  'calendar.months.begins',
  'calendar.months.scrollLabel',
  'calendar.feasts.caption',
  'calendar.feasts.feast',
  'calendar.feasts.ethiopianDate',
  'calendar.feasts.gregorianDate',
  'calendar.feasts.scrollLabel',
  'calendar.fasts.caption',
  'calendar.fasts.fast',
  'calendar.fasts.from',
  'calendar.fasts.to',
  'calendar.fasts.scrollLabel',
  'calendar.untilFasika',
  'calendar.pendingConfirmation',
  'calendar.movableUnavailable',
  'calendar.saint.heading',
  'calendar.saint.annualCaption',
  'calendar.saint.annualScrollLabel',
  'calendar.saint.monthlyCaption',
  'calendar.saint.monthlyScrollLabel',
  'calendar.saint.noteHeader',
  'calendar.saint.annualMarker',
  'home.welcome',
  'home.services.heading',
  'home.services.viewAll',
  'home.nextFeast.heading',
  'home.nextFeast.none',
  'home.feastToday',
  'home.viewCalendar',
  'home.currentFast.heading',
  'home.currentFast.until',
  'home.monthly.heading',
  'home.monthly.none',
  'home.announcements.heading',
  'home.announcements.empty',
  'giving.intro',
  'giving.zelle.heading',
  'giving.zelle.body',
  'giving.paypal.heading',
  'giving.cashApp.heading',
  'giving.mail.heading',
  'giving.notes.heading',
  'giving.notes.noPayment',
  'giving.notes.confirm',
];

// RESEARCHER: the factual claims in calendar.intro (13 months; twelve of 30
// days; Pagume 5, or 6 in a leap year; the year begins on Meskerem 1, near
// September 11; seven to eight years behind the Gregorian calendar) are the
// general facts already verified for the calendar core — see
// docs/research/ecal-reference.md. No new claims are made here; only the
// Amharic wording (calendar.* above) is unreviewed and needs parish sign-off.

// Status: independently verified by RESEARCHER (P1-09). Full register with
// sources: docs/research/about-claims.md (rows C1-C5).
//
// RESEARCHER: factual claims made in services.* prose (src/i18n/en.json and
// am.json), each with its verifying source.
//
// 1. "The Divine Liturgy ... is celebrated in Ge'ez, the Church's ancient
//    liturgical language" (services.liturgy.body) — verified: EOTC official,
//    https://www.ethiopianorthodox.org/english/ethiopian/worship.html; WCC,
//    https://www.oikoumene.org/member-churches/ethiopian-orthodox-tewahedo-church
// 2. "...with the readings and parts of the liturgy also given in Amharic"
//    (services.liturgy.body) — verified: EOTC official worship.html. Corrected
//    in P1-09 from "readings and hymns often", as hymns were not supported.
// 3. "Faithful who plan to receive Holy Communion traditionally observe a
//    fast beforehand" (services.liturgy.body) — verified, kept general (no
//    hours): EOTC official worship.html (celebrants fast >= 12 hours);
//    https://en.wikipedia.org/wiki/Ethiopian_Orthodox_Tewahedo_Church
// 4. "In the Ethiopian Orthodox Tewahedo tradition, Sunday school is where
//    children and youth learn the Christian faith and the traditions of the
//    Church" (services.sundaySchool.body) — verified (general): Mahibere
//    Kidusan, EOTC Sunday School Department, https://eotcmk.org/e/; WCC.
// 5. "Beyond the Divine Liturgy, the Ethiopian Orthodox Tewahedo Church
//    holds prayer services and teaching grounded in the Word of God"
//    (services.prayerTeaching.body) — verified (general): WCC (teaching by
//    clergy); EOTC official site (sermons). "Grounded in the Word of God" is
//    editorial voice.
