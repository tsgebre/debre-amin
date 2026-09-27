import { z } from 'zod';
import { isPlaceholder, ph, PLACEHOLDER_PREFIX } from './placeholder';

// Every real-world fact slot is `placeholder | validRealValue`. A
// placeholder always passes; a real value must be well-formed, so a typo
// in a phone number or URL fails the build instead of shipping quietly.

// `fatal` makes a union fall through to the real-value branch, so a wrong
// value reports the real format ("+1 followed by 10 digits") instead of
// only the placeholder rule.
const placeholderSchema = z.string().superRefine((v, ctx) => {
  if (!isPlaceholder(v)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `placeholder strings must start with the "${PLACEHOLDER_PREFIX}" marker`,
      fatal: true,
    });
  }
});

function phOr<T extends z.ZodTypeAny>(real: T) {
  return z.union([placeholderSchema, real]);
}

function normalizePhone(v: string): string {
  return v.replace(/[\s().-]/g, '');
}

const REAL_PHONE = z.string().refine((v) => /^\+1\d{10}$/.test(normalizePhone(v)), {
  message: 'phone must be +1 followed by 10 digits (spaces, dashes, parentheses allowed)',
});

const REAL_EMAIL = z.string().email();

const REAL_HTTPS_URL = z.string().url().refine((v) => v.startsWith('https://'), {
  message: 'URL must be absolute and https://',
});

const REAL_CASH_APP_TAG = z.string().regex(/^\$[A-Za-z0-9_-]{1,20}$/, {
  message: 'Cash App tag must be "$" followed by 1-20 letters, digits, "_" or "-"',
});

export const phoneOrPh = phOr(REAL_PHONE);
export const emailOrPh = phOr(REAL_EMAIL);
export const urlOrPh = phOr(REAL_HTTPS_URL);
const cashAppTagOrPh = phOr(REAL_CASH_APP_TAG);

const bilingualSchema = z.object({
  en: z.string().min(1),
  am: z.string().min(1),
});

export type Bilingual = z.infer<typeof bilingualSchema>;

/** A placeholder Bilingual value — same marker text in both locales. */
function bilingualPh(location: string): Bilingual {
  return { en: ph(location), am: ph(location) };
}

const addressSchema = z.object({
  street: phOr(z.string().min(1)),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: phOr(z.string().regex(/^\d{5}(-\d{4})?$/)),
  country: z.string().min(1),
});

const serviceSchema = z.object({
  id: z.string().min(1),
  name: bilingualSchema,
  day: z.object({
    en: phOr(z.string().min(1)),
    am: phOr(z.string().min(1)),
  }),
  time: phOr(z.string().regex(/^\d{1,2}:\d{2}\s?(AM|PM)$/i)),
  note: bilingualSchema.optional(),
});

// A real photo must be a local file under public/images/clergy/ — no
// hotlinked URLs, no path traversal, lowercase filename, common extension.
const clergySchema = z.object({
  id: z.string().min(1),
  name: bilingualSchema,
  role: bilingualSchema,
  photo: z
    .string()
    .regex(/^images\/clergy\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/)
    .optional(),
});

const IANA_TIME_ZONE = z.string().refine(
  (tz) => {
    try {
      new Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: 'time zone must be a valid IANA name, e.g. "America/New_York"' },
);

export const siteConfigSchema = z.object({
  timeZone: IANA_TIME_ZONE,
  contact: z.object({
    phone: phoneOrPh,
    email: emailOrPh,
    address: addressSchema,
    mapUrl: urlOrPh,
    directions: bilingualSchema,
  }),
  services: z.array(serviceSchema).min(1),
  clergy: z.array(clergySchema),
  giving: z.object({
    zelle: phOr(z.union([REAL_PHONE, REAL_EMAIL])),
    paypalUrl: urlOrPh,
    cashAppTag: cashAppTagOrPh,
    mailingAddress: phOr(z.string().min(1)),
    gofundmeUrl: urlOrPh,
  }),
  social: z.object({
    facebookUrl: urlOrPh,
  }),
  livestreamUrl: urlOrPh,
  parish: z.object({
    history: bilingualSchema,
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

// Amharic terms above the "TBD —" line here are real, general EOTC
// vocabulary, but their exact wording for THIS parish's weekly schedule
// needs the parish's own confirmation before publishing.
export const CONFIG_AM_NEEDS_REVIEW: readonly string[] = [
  'services.0.name.am', // ቅዳሴ — Divine Liturgy
  'services.1.name.am', // ሰንበት ትምህርት ቤት — Sunday School
  'services.2.name.am', // ጸሎት / ስብከት — weekly prayer/teaching service
];

const config: SiteConfig = {
  // Real value, not a placeholder: the parish is in Greensboro, NC (US Eastern).
  timeZone: 'America/New_York',
  contact: {
    phone: ph('contact.phone'),
    email: ph('contact.email'),
    address: {
      street: ph('contact.address.street'),
      city: 'Greensboro',
      state: 'NC',
      postalCode: ph('contact.address.postalCode'),
      country: 'USA',
    },
    mapUrl: ph('contact.mapUrl'),
    directions: bilingualPh('contact.directions'),
  },
  services: [
    {
      id: 'divine-liturgy',
      name: { en: 'Divine Liturgy', am: 'ቅዳሴ' },
      day: bilingualPh('services.0.day'),
      time: ph('services.0.time'),
    },
    {
      id: 'sunday-school',
      name: { en: 'Sunday School', am: 'ሰንበት ትምህርት ቤት' },
      day: bilingualPh('services.1.day'),
      time: ph('services.1.time'),
    },
    {
      id: 'weekly-prayer-teaching',
      name: { en: 'Prayer & Teaching Service', am: 'ጸሎት / ስብከት' },
      day: bilingualPh('services.2.day'),
      time: ph('services.2.time'),
    },
  ],
  clergy: [
    {
      id: 'clergy-1',
      name: bilingualPh('clergy.0.name'),
      role: { en: 'TBD — e.g. Head Priest (Aleqa)', am: 'TBD — ለምሳሌ፦ አለቃ' },
    },
    {
      id: 'clergy-2',
      name: bilingualPh('clergy.1.name'),
      role: {
        en: 'TBD — e.g. Assistant Priest (Qomos)',
        am: 'TBD — ለምሳሌ፦ ቆሞስ',
      },
    },
    {
      id: 'clergy-3',
      name: bilingualPh('clergy.2.name'),
      role: { en: 'TBD — e.g. Deacon (Diyakon)', am: 'TBD — ለምሳሌ፦ ዲያቆን' },
    },
  ],
  giving: {
    zelle: ph('giving.zelle'),
    paypalUrl: ph('giving.paypalUrl'),
    cashAppTag: ph('giving.cashAppTag'),
    mailingAddress: ph('giving.mailingAddress'),
    // Real value, parish-provided: the "Help Build Our New Church" campaign.
    gofundmeUrl: 'https://www.gofundme.com/f/help-build-our-new-church-7tjhd',
  },
  social: {
    // Real value, parish-provided (a share link to the parish's Facebook
    // presence; replace with the page's own URL once the parish confirms it).
    facebookUrl: 'https://www.facebook.com/share/p/1AAcb8pa6H/',
  },
  livestreamUrl: ph('livestreamUrl'),
  parish: {
    history: bilingualPh('parish.history'),
  },
};

// A build error a volunteer can act on: each bad field's path and expected format.
export function formatConfigError(error: z.ZodError): string {
  const lines = error.issues.map((issue) => {
    const where = issue.path.join('.') || '(root)';
    const messages =
      issue.code === 'invalid_union'
        ? issue.unionErrors.flatMap((e) => e.issues.map((i) => i.message))
        : [issue.message];
    return `  - ${where}: ${[...new Set(messages)].join('; OR ')}`;
  });
  return [
    'src/data/site.ts has invalid values:',
    ...lines,
    `(Any of these may instead be a placeholder starting with "${PLACEHOLDER_PREFIX}".)`,
  ].join('\n');
}

export function parseSiteConfig(input: unknown): SiteConfig {
  const result = siteConfigSchema.safeParse(input);
  if (!result.success) throw new Error(formatConfigError(result.error));
  return result.data;
}

export const siteConfig: SiteConfig = parseSiteConfig(config);

export function placeholderFields(value: unknown, path: string[] = []): string[] {
  if (typeof value === 'string') {
    return isPlaceholder(value) ? [path.join('.')] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => placeholderFields(item, [...path, String(i)]));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, v]) => placeholderFields(v, [...path, key]));
  }
  return [];
}

export default siteConfig;
