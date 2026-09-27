import { z } from 'zod';
import { isValidGregorianDate } from '../lib/ecal';

// Plain zod (no `astro:content`) so vitest can import it directly.
// An illustration for an About section: a local file only, with required
// dimensions (no layout shift) and a visible credit, since the two shipped
// photographs are CC BY-SA and attribution is a license condition.
const aboutImageSchema = z
  .object({
    src: z
      .string()
      .regex(
        /^images\/[a-z0-9/-]+\.(jpg|jpeg|png|webp|svg)$/,
        'image must be a local file under images/, lowercase, no path traversal',
      ),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string().min(1),
    caption: z.string().min(1).optional(),
    credit: z.string().min(1),
    creditUrl: z
      .string()
      .url()
      .refine((u) => u.startsWith('https://'), { message: 'credit URL must be https://' }),
  })
  .strict();

export const aboutSchema = z.object({
  title: z.string().min(1),
  lang: z.enum(['en', 'am']),
  section: z.enum(['eotc', 'saint']),
  order: z.number(),
  image: aboutImageSchema.optional(),
  sources: z
    .array(
      z.object({
        title: z.string().min(1),
        url: z
          .string()
          .url()
          .refine((u) => u.startsWith('https://'), { message: 'source URL must be https://' }),
      }),
    )
    .min(2),
  researchVerified: z.literal(true, {
    errorMap: () => ({ message: 'researchVerified must be true to ship' }),
  }),
  amReviewPending: z.boolean(),
});

export type AboutEntry = z.infer<typeof aboutSchema>;
export const ABOUT_SECTIONS = aboutSchema.shape.section.options;

const bilingualTextSchema = z.object({
  en: z.string().min(1),
  am: z.string().min(1),
});

// A plain YYYY-MM-DD string, not a JS Date, so no time zone can shift it.
// isValidGregorianDate rejects a well-formed-but-impossible date like Feb 30.
function isRealDateString(s: string): boolean {
  const [year, month, day] = s.split('-').map(Number);
  return isValidGregorianDate({ year, month, day });
}

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD form')
  .refine(isRealDateString, { message: 'date must be a real Gregorian calendar date' });

export const eventSchema = z
  .object({
    type: z.enum(['event', 'announcement']),
    title: bilingualTextSchema,
    summary: bilingualTextSchema,
    date: dateStringSchema,
    endDate: dateStringSchema.optional(),
    time: z.string().min(1).optional(),
    location: bilingualTextSchema.optional(),
    bodyLang: z.enum(['en', 'am']).default('en'),
    draft: z.boolean().default(false),
  })
  .superRefine((val, ctx) => {
    // YYYY-MM-DD strings compare lexicographically in calendar order.
    if (val.endDate !== undefined && val.endDate < val.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endDate must not be before date',
        path: ['endDate'],
      });
    }
  });

export type EventEntry = z.infer<typeof eventSchema>;

export const gallerySchema = z
  .object({
    image: z
      .string()
      .regex(
        /^images\/gallery\/[a-z0-9-]+\.(jpg|jpeg|png|webp|svg)$/,
        'image must be a local file under images/gallery/, lowercase, no path traversal',
      ),
    // Required (not inferred from the file) so the browser reserves space
    // before the image loads, preventing layout shift.
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: bilingualTextSchema,
    caption: bilingualTextSchema.optional(),
    date: dateStringSchema.optional(),
    order: z.number().int().optional(),
    placeholder: z.boolean().default(false),
  })
  .strict();

export type GalleryEntry = z.infer<typeof gallerySchema>;

// The Amharic alt/caption text on the six shipped placeholder-N.yaml
// entries is original wording, not yet confirmed by the parish — the
// content-collection equivalent of src/i18n/review.ts's AM_NEEDS_REVIEW.
export const GALLERY_AM_NEEDS_REVIEW: readonly string[] = [
  'placeholder-1',
  'placeholder-2',
  'placeholder-3',
  'placeholder-4',
  'placeholder-5',
  'placeholder-6',
  'processional-cross',
  'saint-icon',
  'building-campaign',
];
