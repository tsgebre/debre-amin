import { z } from 'zod';
import { isValidGregorianDate } from '../lib/ecal';

// Plain zod (no `astro:content`) so vitest can import it directly.
export const aboutSchema = z.object({
  title: z.string().min(1),
  lang: z.enum(['en', 'am']),
  section: z.enum(['eotc', 'saint']),
  order: z.number(),
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
