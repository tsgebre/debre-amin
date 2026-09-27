import { z } from 'zod';

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
