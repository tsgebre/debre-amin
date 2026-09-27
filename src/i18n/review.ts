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
];

// Status: self-reviewed by Implementer; pending independent RESEARCHER
// sign-off in P1-09 (About page research task).
//
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
// 4. "In the Ethiopian Orthodox Tewahedo tradition, Sunday school is where
//    children and youth learn the Christian faith and the traditions of the
//    Church" (services.sundaySchool.body) — Sunday school as a form of
//    Christian education for youth is a standard practice in EOTC parishes;
//    definitional description consistent with tradition.
// 5. "Beyond the Divine Liturgy, the Ethiopian Orthodox Tewahedo Church
//    holds prayer services and teaching grounded in the Word of God"
//    (services.prayerTeaching.body) — prayer services and teaching (ስብከት)
//    beyond the Divine Liturgy are established practices in EOTC tradition;
//    documented in parish and denominational resources.
