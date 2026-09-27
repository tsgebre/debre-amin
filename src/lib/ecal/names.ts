// Ethiopian month names, index 0 = Meskerem (month 1) .. index 12 = Pagume (month 13).

export const ETHIOPIAN_MONTHS_EN = [
  'Meskerem',
  'Tikimt',
  'Hidar',
  'Tahsas',
  'Tir',
  'Yekatit',
  'Megabit',
  'Miyazia',
  'Ginbot',
  'Sene',
  'Hamle',
  'Nehase',
  'Pagume',
] as const;

export const ETHIOPIAN_MONTHS_AM = [
  'መስከረም',
  'ጥቅምት',
  'ኅዳር',
  'ታኅሣሥ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
  'ጳጉሜን',
] as const;

// Amharic strings a parish reviewer should confirm. These are orthography
// and convention questions, not questions about the conversion arithmetic.
export const ECAL_AM_NEEDS_REVIEW: readonly string[] = [
  'ETHIOPIAN_MONTHS_AM[3] "ታኅሣሥ" — the variants ታኅሳስ / ታህሳስ are also in use; confirm the preferred orthography',
  'ETHIOPIAN_MONTHS_AM[12] "ጳጉሜን" — the variant ጳጉሜ is also common; confirm the preferred form',
  'formatEthiopian Amharic pattern "<ወር> <ቀን> ቀን <ዓመት> ዓ.ም." uses Western digits; confirm whether Ge\'ez numerals are preferred',
  'formatGregorian Amharic month names come from Node\'s CLDR "am" locale data (e.g. ሴፕቴምበር); confirm they suit the parish',
];
