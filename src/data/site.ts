import { z } from 'zod';

const siteConfigSchema = z.object({
  siteName: z.object({
    en: z.string().min(1),
    am: z.string().min(1),
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

const siteConfig: SiteConfig = siteConfigSchema.parse({
  siteName: {
    en: 'Debre Amin Abune Teklehaymanot Ethiopian Orthodox Tewahedo Church',
    am: 'ደብረ አሚን አቡነ ተክለ ሃይማኖት',
  },
});

export default siteConfig;
