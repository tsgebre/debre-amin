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
];

// RESEARCHER: factual claims made in services.* prose (src/i18n/en.json and
// am.json), each with a one-line justification. Claims without one of these
// were removed rather than shipped unverified.
//
// 1. "The Divine Liturgy ... is celebrated in Ge'ez, the Church's ancient
//    liturgical language" (services.liturgy.body) — Ge'ez is the
//    established liturgical language of the EOTC; standard reference:
//    Encyclopaedia Britannica, "Ethiopian Orthodox Tewahedo Church."
// 2. "...with readings and hymns often also given in Amharic"
//    (services.liturgy.body) — widely documented practice of using Amharic
//    alongside Ge'ez for readings/hymns in EOTC parishes, especially in the
//    diaspora; consistent across EOTC parish-published service descriptions.
// 3. "Faithful who plan to receive Holy Communion traditionally observe a
//    fast beforehand" (services.liturgy.body) — pre-communion fasting is a
//    standard, well-documented Oriental Orthodox (including EOTC) practice.
// 4. "Sunday school ... serves children and youth" (services.sundaySchool.body)
//    — definitional description of a Sunday school; consistent with EOTC
//    Sunday-school (ሰንበት ትምህርት ቤት) programs described by parish sources.
